import { WebSocketServer } from "ws";
import {
  closeMongoDatabase,
  connectMongoDatabase
} from "./infrastructure/mongodb/index.js";
import {
  closeRedisConnection,
  connectRedisDatabase
} from "./infrastructure/redis/redisClient.js";
import { createWebSocketServer } from "./server/websocketServer.js";

await connectMongoDatabase();
await connectRedisDatabase();
const websocketServer = createWebSocketServer(WebSocketServer);
let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  websocketServer.close();
  await closeMongoDatabase();
  await closeRedisConnection();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
