import type { WebSocket } from "ws";
import type { ServerMessageType } from "../constants/messageTypes.js";

export interface ServerResponse {
  type: ServerMessageType;
  payload: unknown;
}

export type SocketMessageParseResult<TMessage> =
  | { ok: true; message: TMessage }
  | { ok: false; error: string; details?: Record<string, unknown> };

export type SocketMessageParser<TMessage> = (
  rawMessage: string
) => SocketMessageParseResult<TMessage>;

export type SocketControllerHandler<TMessage> = (
  message: TMessage
) => Promise<ServerResponse>;

export interface RegisterSocketControllerOptions<TMessage> {
  ws: WebSocket;
  parseMessage: SocketMessageParser<TMessage>;
  handleMessage: SocketControllerHandler<TMessage>;
  connectedPayload?: Record<string, unknown>;
}

export type QueuedSocketMessageHandler = (rawMessage: string) => Promise<void>;
