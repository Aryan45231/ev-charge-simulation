import type { FinalBill } from "./billingTypes";
import { ServerMessageType } from "../constants/websocketMessageTypes";

export interface TransactionStartedPayload {
  transactionId: string;
}

export interface MeterValueAcceptedPayload {
  transactionId: string;
  consumption: number;
  recordedAt: string;
}

export interface ServerErrorPayload {
  message: string;
}

export type TransactionEndedPayload = FinalBill;

export type ServerMessage =
  | {
      type: ServerMessageType.TRANSACTION_STARTED;
      payload: TransactionStartedPayload;
    }
  | {
      type: ServerMessageType.METER_VALUE_ACCEPTED;
      payload: MeterValueAcceptedPayload;
    }
  | {
      type: ServerMessageType.TRANSACTION_ENDED;
      payload: TransactionEndedPayload;
    }
  | {
      type: ServerMessageType.ERROR;
      payload: ServerErrorPayload;
    };
