export enum ConnectionStatus {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error"
}

export interface WebSocketMessage<TPayload = unknown> {
  type: string;
  payload: TPayload;
}
