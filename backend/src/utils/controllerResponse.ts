import { ServerMessageType } from "../constants/messageTypes.js";
import type { ErrorControllerResponse } from "../types/controllerResponse.js";

export function createErrorResponse(
  message: string,
  transactionId?: string
): ErrorControllerResponse {
  return {
    type: ServerMessageType.ERROR,
    payload: { message, transactionId }
  };
}
