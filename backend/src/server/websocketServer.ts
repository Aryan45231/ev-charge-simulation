// Shared server factory: used by both local runtime and Vercel API entrypoint to avoid duplicated setup.
import express from "express";
import { createServer, type IncomingMessage, type Server } from "node:http";
import { WebSocketServer } from "ws";
import { config } from "../config/appConfig.js";
import { registerTransactionSocket } from "../controllers/transaction/index.js";
import { ensureInfrastructureReady } from "../infrastructure/index.js";
import { logger } from "../utils/logger.js";
import { isAllowedOrigin } from "../utils/origin.js";

interface WebSocketVerifyInfo {
  origin: string;
  req: IncomingMessage;
  secure: boolean;
}

type VerifyClientCallback = (verified: boolean, code?: number, message?: string) => void;

export interface ApplicationServer {
  httpServer: Server;
  webSocketServer: WebSocketServer;
}

export function createApplicationServer(): ApplicationServer {
  const app = express();
  const httpServer = createServer(app);
  const webSocketServer = new WebSocketServer({
    server: httpServer,
    verifyClient: verifyWebSocketOrigin
  });

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  webSocketServer.on("connection", (ws) => {
    ensureInfrastructureReady()
      .then(() => {
        registerTransactionSocket(ws);
      })
      .catch((error) => {
        logger.error("Failed to initialize WebSocket infrastructure", error);
        ws.close(1011, "Server initialization failed");
      });
  });

  return {
    httpServer,
    webSocketServer
  };
}

export function listenApplicationServer(httpServer: Server): void {
  httpServer.listen(config.port, () => {
    logger.info("WebSocket server listening", {
      allowedOrigins: config.allowedOrigins,
      url: `ws://localhost:${config.port}`
    });
  });
}

function verifyWebSocketOrigin(
  info: WebSocketVerifyInfo,
  callback: VerifyClientCallback
): void {
  const origin = info.origin || info.req.headers.origin;

  if (isAllowedOrigin(origin, config.allowedOrigins)) {
    callback(true);
    return;
  }

  logger.warn("Blocked WebSocket connection from disallowed origin", { origin });
  callback(false, 403, "Forbidden origin");
}
