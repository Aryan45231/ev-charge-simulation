import {
  closeMongoDatabase,
  connectMongoDatabase
} from "./mongodb/index.js";
import {
  closeRedisConnection,
  connectRedisDatabase
} from "./redis/redisClient.js";
import { logger } from "../utils/logger.js";

let infrastructureReadyPromise: Promise<void> | null = null;

export function ensureInfrastructureReady(): Promise<void> {
  if (!infrastructureReadyPromise) {
    infrastructureReadyPromise = connectInfrastructure();
  }

  return infrastructureReadyPromise;
}

export async function closeInfrastructureConnections(): Promise<void> {
  await closeMongoDatabase();
  await closeRedisConnection();
}

async function connectInfrastructure(): Promise<void> {
  await connectRedisDatabase();

  try {
    await connectMongoDatabase();
  } catch (error) {
    logger.warn("MongoDB connection skipped; Redis session state remains available", error);
  }
}
