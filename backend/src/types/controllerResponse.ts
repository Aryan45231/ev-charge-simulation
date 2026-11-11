import { ServerMessageType } from "../constants/messageTypes.js";

export interface ErrorResponsePayload {
  message: string;
  transactionId?: string;
}

export interface ErrorControllerResponse {
  type: ServerMessageType.ERROR;
  payload: ErrorResponsePayload;
}
