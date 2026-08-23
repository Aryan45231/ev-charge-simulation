import type { TransactionStatus } from "../constants/messageTypes.js";

export interface TransactionRecord {
  id: string;
  status: TransactionStatus;
  pricePerKwh: string;
  startedAt: string;
}

export interface MeterReading {
  consumption: number;
  recordedAt: string;
}

export interface Bill {
  firstMeterValue: number;
  lastMeterValue: number;
  energyConsumedKwh: number;
  pricePerKwh: number;
  totalCost: number;
}

export type AddMeterReadingResult =
  | { ok: true; reading: MeterReading }
  | { ok: false; reason: "not_found" | "not_active" | "meter_decreased" };
