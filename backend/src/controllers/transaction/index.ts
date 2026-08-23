import type { WebSocket } from "ws";
import { config } from "../../config/appConfig.js";
import { ClientMessageType } from "../../constants/messageTypes.js";
import type {
  ClientMessage,
  ControllerResponse,
} from "../../protocol/webSocket/websocketMessageTypes.js";
import { parseClientMessage } from "../../protocol/webSocket/websocketMessageProtocol.js";
import { registerSocketController } from "../../utils/websocket.js";
import {
  endTransaction,
  recordMeterValue,
  startTransaction,
} from "./controller.js";



function handleClientMessage(
  message: ClientMessage,
): Promise<ControllerResponse> {
  switch (message.type) {
    case ClientMessageType.START_TRANSACTION:
      return startTransaction(message.payload);
    case ClientMessageType.METER_VALUE:
      return recordMeterValue(message.payload);
    case ClientMessageType.END_TRANSACTION:
      return endTransaction(message.payload);
  }
}

export function registerTransactionSocket(ws: WebSocket): void {
  registerSocketController<ClientMessage>({
    ws,
    connectedPayload: { pricePerKwh: config.pricePerKwh },
    parseMessage: parseClientMessage,
    handleMessage: handleClientMessage
  });
}


