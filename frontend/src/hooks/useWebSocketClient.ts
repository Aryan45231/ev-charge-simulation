import { useCallback, useEffect, useRef, useState } from "react";
import { config } from "../config";
import { ConnectionStatus, type WebSocketMessage } from "../types/websocketTypes";
import { logger } from "../utils/logger";

interface UseWebSocketClientOptions {
  onClose: () => void;
  onMessage: (message: WebSocketMessage) => void;
}

export function useWebSocketClient({
  onClose,
  onMessage
}: UseWebSocketClientOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const onCloseRef = useRef(onClose);
  const onMessageRef = useRef(onMessage);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.CONNECTING
  );

  useEffect(() => {
    onCloseRef.current = onClose;
    onMessageRef.current = onMessage;
  }, [onClose, onMessage]);

  const sendMessage = useCallback(
    (type: string, payload: Record<string, unknown>): boolean => {
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        logger.warn("WebSocket message skipped because server is disconnected", { type });
        return false;
      }

      socketRef.current.send(JSON.stringify({ type, payload }));
      return true;
    },
    []
  );

  useEffect(() => {
    const socket = new WebSocket(config.webSocketUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      logger.info("WebSocket connected", { url: config.webSocketUrl });
    });

    socket.addEventListener("close", () => {
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      logger.warn("WebSocket disconnected", { url: config.webSocketUrl });
      onCloseRef.current();
    });

    socket.addEventListener("error", () => {
      setConnectionStatus(ConnectionStatus.ERROR);
      logger.error("WebSocket connection error", { url: config.webSocketUrl });
    });

    socket.addEventListener("message", (event) => {
      try {
        onMessageRef.current(JSON.parse(event.data) as WebSocketMessage);
      } catch (error) {
        logger.error("Failed to parse WebSocket message", error);
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  return {
    connectionStatus,
    sendMessage
  };
}
