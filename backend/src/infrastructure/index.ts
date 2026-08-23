import {
  closeMongoDatabase,
  connectMongoDatabase
} from "./mongodb/index.js";
import {
  closeRedisConnection,
  connectRedisDatabase
} from "./redis/redisClient.js";

let infrastructureReadyPromise: Promise<void> | null = null;

export function ensureInfrastructureReady(): Promise<void> {
  if (!infrastructureReadyPromise) {
    infrastructureReadyPromise = Promise.all([
      connectMongoDatabase(),
      connectRedisDatabase()
    ]).then(() => undefined);
  }

  return infrastructureReadyPromise;
}

export async function closeInfrastructureConnections(): Promise<void> {
  await closeMongoDatabase();
  await closeRedisConnection();
}
