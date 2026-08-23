import type { IncomingMessage } from "node:http";
import type { WebSocketServer } from "ws";
import { config } from "../config/appConfig.js";
import { registerTransactionSocket } from "../controllers/transaction/index.js";
import { logger } from "../utils/logger.js";
import { isAllowedOrigin } from "../utils/origin.js";

interface WebSocketVerifyInfo {
  origin: string;
  req: IncomingMessage;
  secure: boolean;
}

type VerifyClientCallback = (verified: boolean, code?: number, message?: string) => void;

type WebSocketServerConstructor = new (options: {
  port: number;
  verifyClient: (info: WebSocketVerifyInfo, callback: VerifyClientCallback) => void;
}) => WebSocketServer;

export function createWebSocketServer(
  WebSocketServerClass: WebSocketServerConstructor
): WebSocketServer {
  const wss = new WebSocketServerClass({
    port: config.port,
    verifyClient(info, callback) {
      const origin = info.origin || info.req.headers.origin;

      if (isAllowedOrigin(origin, config.allowedOrigins)) {
        callback(true);
        return;
      }

      logger.warn("Blocked WebSocket connection from disallowed origin", { origin });
      callback(false, 403, "Forbidden origin");
    }
  });

  wss.on("connection", (ws) => {
    registerTransactionSocket(ws);
  });

  wss.on("listening", () => {
    logger.info("WebSocket server listening", {
      allowedOrigins: config.allowedOrigins,
      url: `ws://localhost:${config.port}`
    });
  });

  return wss;
}
