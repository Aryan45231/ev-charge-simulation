import { ClientMessageType } from "../../constants/messageTypes.js";
import { JavaScriptType } from "../../constants/javascriptTypes.js";
import type {
  ParseClientMessageResult,
  UnknownSocketMessage
} from "./websocketMessageTypes.js";

export function parseClientMessage(rawMessage: string): ParseClientMessageResult {
  let message: UnknownSocketMessage;

  try {
    message = JSON.parse(rawMessage) as UnknownSocketMessage;
  } catch {
    return { ok: false, error: "Invalid JSON message" };
  }

  if (message.type === ClientMessageType.START_TRANSACTION) {
    return parseTransactionMessage(message, ClientMessageType.START_TRANSACTION);
  }

  if (message.type === ClientMessageType.METER_VALUE) {
    return parseMeterValueMessage(message);
  }

  if (message.type === ClientMessageType.END_TRANSACTION) {
    return parseTransactionMessage(message, ClientMessageType.END_TRANSACTION);
  }

  return {
    ok: false,
    error: "Unsupported message type",
    details: { type: message.type }
  };
}

function parseTransactionMessage(
  message: UnknownSocketMessage,
  type: ClientMessageType.START_TRANSACTION | ClientMessageType.END_TRANSACTION
): ParseClientMessageResult {
  const payload = asRecord(message.payload);
  const transactionId = payload?.transactionId;

  if (!isValidTransactionId(transactionId)) {
    return { ok: false, error: "transactionId is required" };
  }

  return {
    ok: true,
    message: {
      type,
      payload: { transactionId }
    }
  };
}

function parseMeterValueMessage(message: UnknownSocketMessage): ParseClientMessageResult {
  const payload = asRecord(message.payload);
  const transactionId = payload?.transactionId;
  const consumption = Number(payload?.consumption);

  if (!isValidTransactionId(transactionId)) {
    return { ok: false, error: "transactionId is required" };
  }

  if (!isValidConsumption(consumption)) {
    return {
      ok: false,
      error: "consumption must be a non-negative number",
      details: { transactionId }
    };
  }

  return {
    ok: true,
    message: {
      type: ClientMessageType.METER_VALUE,
      payload: { transactionId, consumption }
    }
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== JavaScriptType.OBJECT || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function isValidTransactionId(transactionId: unknown): transactionId is string {
  if (typeof transactionId !== JavaScriptType.STRING) {
    return false;
  }

  return (transactionId as string).trim().length > 0;
}

function isValidConsumption(consumption: unknown): consumption is number {
  if (typeof consumption !== JavaScriptType.NUMBER) {
    return false;
  }

  const numericConsumption = consumption as number;
  return Number.isFinite(numericConsumption) && numericConsumption >= 0;
}
