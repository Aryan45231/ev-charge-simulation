import { config } from "../../config/appConfig.js";
import { TransactionStatus } from "../../constants/messageTypes.js";
import { redisClient } from "../../infrastructure/redis/redisClient.js";
import { RedisKeys } from "../../infrastructure/redis/redisKeys.js";
import type {
  AddMeterReadingResult,
  Bill,
  MeterReading,
  TransactionRecord
} from "../../types/domain.js";

export async function createTransaction(transactionId: string): Promise<boolean> {
  const transactionKey = RedisKeys.transaction(transactionId);
  const alreadyExists = await redisClient.exists(transactionKey);

  if (alreadyExists) {
    return false;
  }

  await redisClient
    .multi()
    .hset(transactionKey, {
      id: transactionId,
      status: TransactionStatus.ACTIVE,
      pricePerKwh: String(config.pricePerKwh),
      startedAt: new Date().toISOString()
    })
    .sadd(RedisKeys.activeTransactions(), transactionId)
    .expire(transactionKey, config.sessionTtlSeconds)
    .exec();

  return true;
}

export async function findTransaction(
  transactionId: string
): Promise<TransactionRecord | null> {
  const transaction = await redisClient.hgetall(RedisKeys.transaction(transactionId));
  return transaction.id ? (transaction as unknown as TransactionRecord) : null;
}

export async function addMeterReading(
  transactionId: string,
  consumption: number
): Promise<AddMeterReadingResult> {
  const transaction = await findTransaction(transactionId);

  if (!transaction) {
    return { ok: false, reason: "not_found" };
  }

  if (transaction.status !== TransactionStatus.ACTIVE) {
    return { ok: false, reason: "not_active" };
  }

  const latestReading = await getLatestMeterReading(transactionId);

  if (latestReading && consumption < latestReading.consumption) {
    return { ok: false, reason: "meter_decreased" };
  }

  const reading = {
    consumption,
    recordedAt: new Date().toISOString()
  };

  await redisClient
    .multi()
    .rpush(RedisKeys.meterReadings(transactionId), JSON.stringify(reading))
    .expire(RedisKeys.meterReadings(transactionId), config.sessionTtlSeconds)
    .exec();

  return { ok: true, reading };
}

export async function getFirstMeterReading(
  transactionId: string
): Promise<MeterReading | null> {
  const firstReading = await redisClient.lindex(RedisKeys.meterReadings(transactionId), 0);
  return parseMeterReading(firstReading);
}

export async function getLatestMeterReading(
  transactionId: string
): Promise<MeterReading | null> {
  const latestReading = await redisClient.lindex(RedisKeys.meterReadings(transactionId), -1);
  return parseMeterReading(latestReading);
}

export async function endTransaction(transactionId: string, bill: Bill): Promise<string> {
  const endedAt = new Date().toISOString();

  await redisClient
    .multi()
    .del(RedisKeys.transaction(transactionId))
    .del(RedisKeys.meterReadings(transactionId))
    .srem(RedisKeys.activeTransactions(), transactionId)
    .exec();

  return endedAt;
}

function parseMeterReading(value: string | null): MeterReading | null {
  if (!value) {
    return null;
  }

  return JSON.parse(value);
}

export function calculateBill(
  firstReading: MeterReading | null,
  latestReading: MeterReading | null,
  pricePerKwh = config.pricePerKwh
): Bill {
  const firstMeterValue = firstReading?.consumption ?? 0;
  const lastMeterValue = latestReading?.consumption ?? firstMeterValue;
  const energyConsumedKwh = roundToTwo(lastMeterValue - firstMeterValue);
  const totalCost = roundToTwo(energyConsumedKwh * pricePerKwh);

  return {
    firstMeterValue,
    lastMeterValue,
    energyConsumedKwh,
    pricePerKwh,
    totalCost
  };
}

export function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
