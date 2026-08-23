import { config } from "../../config/appConfig.js";
import { ServerMessageType, TransactionStatus } from "../../constants/messageTypes.js";
import { createErrorResponse } from "../../utils/controllerResponse.js";
import * as transactionService from "./service.js";
import type {
  ControllerResponse,
  EndTransactionPayload,
  MeterValuePayload,
  StartTransactionPayload
} from "../../protocol/webSocket/websocketMessageTypes.js";

export async function startTransaction(
  payload: StartTransactionPayload
): Promise<ControllerResponse> {
  const created = await transactionService.createTransaction(payload.transactionId);

  if (!created) {
    return createErrorResponse("Transaction already exists", payload.transactionId);
  }

  return {
    type: ServerMessageType.TRANSACTION_STARTED,
    payload: { transactionId: payload.transactionId }
  };
}

export async function recordMeterValue(
  payload: MeterValuePayload
): Promise<ControllerResponse> {
  const result = await transactionService.addMeterReading(
    payload.transactionId,
    payload.consumption
  );

  if (!result.ok) {
    const errorMessages = {
      not_found: "Transaction not found",
      not_active: "Transaction is not active",
      meter_decreased: "Meter value cannot decrease"
    };

    return createErrorResponse(errorMessages[result.reason], payload.transactionId);
  }

  return {
    type: ServerMessageType.METER_VALUE_ACCEPTED,
    payload: {
      transactionId: payload.transactionId,
      consumption: payload.consumption,
      recordedAt: result.reading.recordedAt
    }
  };
}

export async function endTransaction(
  payload: EndTransactionPayload
): Promise<ControllerResponse> {
  const transaction = await transactionService.findTransaction(payload.transactionId);

  if (!transaction) {
    return createErrorResponse("Transaction not found", payload.transactionId);
  }

  if (transaction.status !== TransactionStatus.ACTIVE) {
    return createErrorResponse("Transaction is not active", payload.transactionId);
  }

  const firstReading = await transactionService.getFirstMeterReading(payload.transactionId);
  const latestReading = await transactionService.getLatestMeterReading(payload.transactionId);
  const pricePerKwh = Number(transaction.pricePerKwh || config.pricePerKwh);
  const bill = transactionService.calculateBill(firstReading, latestReading, pricePerKwh);
  const endedAt = await transactionService.endTransaction(payload.transactionId, bill);

  return {
    type: ServerMessageType.TRANSACTION_ENDED,
    payload: {
      transactionId: payload.transactionId,
      ...bill,
      startedAt: transaction.startedAt,
      endedAt
    }
  };
}
