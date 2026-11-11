import type { RawData, WebSocket } from "ws";
import { JavaScriptType } from "../constants/javascriptTypes.js";
import { ServerMessageType } from "../constants/messageTypes.js";
import type {
  QueuedSocketMessageHandler,
  RegisterSocketControllerOptions,
  ServerResponse,
  SocketControllerHandler,
  SocketMessageParser
} from "../types/websocket.js";
import { logger } from "./logger.js";

export function sendSocketMessage(
  ws: WebSocket,
  messageOrType: ServerResponse | ServerMessageType,
  payload?: unknown
): void {
  const message =
    typeof messageOrType === JavaScriptType.STRING
      ? { type: messageOrType, payload }
      : messageOrType;

  ws.send(JSON.stringify(message));
}

export function sendSocketError(
  ws: WebSocket,
  message: string,
  details: Record<string, unknown> = {}
): void {
  sendSocketMessage(ws, ServerMessageType.ERROR, { message, ...details });
}

export function sendSocketConnected(
  ws: WebSocket,
  payload: Record<string, unknown>
): void {
  sendSocketMessage(ws, ServerMessageType.CONNECTED, payload);
}

export function sendSocketProcessingError(
  ws: WebSocket,
  error: unknown,
  logMessage = "Failed to process WebSocket message"
): void {
  logger.error(logMessage, error);
  sendSocketError(ws, "Server failed to process message");
}

export function registerQueuedSocketMessageHandler(
  ws: WebSocket,
  handler: QueuedSocketMessageHandler
): void {
  let messageQueue = Promise.resolve<void>(undefined);

  ws.on("message", (rawMessage: RawData) => {
    messageQueue = messageQueue
      .then(() => handler(rawMessage.toString()))
      .catch((error) => {
        sendSocketProcessingError(ws, error, "WebSocket message queue failed");
      });
  });
}


async function handleRawSocketControllerMessage<TMessage>(
  ws: WebSocket,
  rawMessage: string,
  parseMessage: SocketMessageParser<TMessage>,
  handleMessage: SocketControllerHandler<TMessage>,
): Promise<void> {
  const parsedMessage = parseMessage(rawMessage);

  if (!parsedMessage.ok) {
    sendSocketError(ws, parsedMessage.error, parsedMessage.details);
    return;
  }

  try {
    const response = await handleMessage(parsedMessage.message);
    sendSocketMessage(ws, response);
  } catch (error) {
    sendSocketProcessingError(ws, error);
  }
}


export function registerSocketController<TMessage>({
  ws,
  parseMessage,
  handleMessage,
  connectedPayload
}: RegisterSocketControllerOptions<TMessage>): void {
  if (connectedPayload) {
    sendSocketConnected(ws, connectedPayload);
  }

  registerQueuedSocketMessageHandler(ws, (rawMessage) =>
    handleRawSocketControllerMessage(ws, rawMessage, parseMessage, handleMessage)
  );
}

