import { ClientMessageType, ServerMessageType } from "../../constants/messageTypes.js";
import type { ErrorControllerResponse } from "../../types/controllerResponse.js";

export interface StartTransactionPayload {
  transactionId: string;
}

export interface MeterValuePayload {
  transactionId: string;
  consumption: number;
}

export interface EndTransactionPayload {
  transactionId: string;
}

export type ClientMessage =
  | {
      type: ClientMessageType.START_TRANSACTION;
      payload: StartTransactionPayload;
    }
  | {
      type: ClientMessageType.METER_VALUE;
      payload: MeterValuePayload;
    }
  | {
      type: ClientMessageType.END_TRANSACTION;
      payload: EndTransactionPayload;
    };

export type ParseClientMessageResult =
  | { ok: true; message: ClientMessage }
  | { ok: false; error: string; details?: Record<string, unknown> };

export interface UnknownSocketMessage {
  type?: unknown;
  payload?: unknown;
}

export type ControllerResponse =
  | { type: ServerMessageType.TRANSACTION_STARTED; payload: { transactionId: string } }
  | {
      type: ServerMessageType.METER_VALUE_ACCEPTED;
      payload: { transactionId: string; consumption: number; recordedAt: string };
    }
  | {
      type: ServerMessageType.TRANSACTION_ENDED;
      payload: {
        transactionId: string;
        firstMeterValue: number;
        lastMeterValue: number;
        energyConsumedKwh: number;
        pricePerKwh: number;
        totalCost: number;
        startedAt: string;
        endedAt: string;
      };
    }
  | ErrorControllerResponse;
