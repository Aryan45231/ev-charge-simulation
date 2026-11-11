import { Redis, type RedisOptions } from "ioredis";
import { config } from "../../config/appConfig.js";
import { logger } from "../../utils/logger.js";

const redisOptions: RedisOptions = {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  password: config.redisPassword,
  retryStrategy(retryCount: number) {
    return Math.min(retryCount * 100, 2_000);
  },
  username: config.redisUsername
};

export const redisClient = createRedisClient();

redisClient.on("ready", () => {
  logger.info("Redis connection ready", {
    redis: getSafeRedisConnectionLabel(),
    usernameConfigured: Boolean(config.redisUsername)
  });
});

redisClient.on("error", (error: Error) => {
  logger.error("Redis connection error", error);
});

export async function connectRedisDatabase(): Promise<void> {
  try {
    if (redisClient.status !== "ready") {
      await redisClient.connect();
    }

    await redisClient.ping();
  } catch (error) {
    logger.error("Failed to connect to Redis", error);
    throw error;
  }
}

export async function closeRedisConnection(): Promise<void> {
  try {
    await redisClient.quit();
  } catch {
    redisClient.disconnect();
  }
}

function sanitizeRedisUrl(redisUrl: string): string {
  try {
    const parsedUrl = new URL(redisUrl);
    parsedUrl.username = "";
    parsedUrl.password = "";
    return parsedUrl.toString();
  } catch {
    return "redis://[invalid-url]";
  }
}

function createRedisClient(): Redis {
  if (config.redisHost) {
    return new Redis({
      ...redisOptions,
      host: config.redisHost,
      port: config.redisPort || 6379
    });
  }

  return new Redis(config.redisUrl, redisOptions);
}

function getSafeRedisConnectionLabel(): string {
  if (config.redisHost) {
    return `${config.redisHost}:${config.redisPort || 6379}`;
  }

  return sanitizeRedisUrl(config.redisUrl);
}
