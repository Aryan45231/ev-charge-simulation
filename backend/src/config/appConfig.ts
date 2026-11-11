import { config as loadEnv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(configDirectory, "../../.env") });

interface AppConfig {
  allowedOrigins: string[];
  mongodbUri: string;
  port: number;
  redisHost?: string;
  redisPassword?: string;
  redisPort?: number;
  redisUsername?: string;
  redisUrl: string;
  pricePerKwh: number;
  sessionTtlSeconds: number;
}

export const config: AppConfig = {
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/ev_charger",
  port: Number(process.env.PORT || 8080),
  redisHost: getOptionalEnvValue(process.env.REDIS_HOST),
  redisPassword: getOptionalEnvValue(process.env.REDIS_PASSWORD),
  redisPort: getOptionalNumberValue(process.env.REDIS_PORT),
  redisUsername: getOptionalEnvValue(process.env.REDIS_USERNAME),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  pricePerKwh: Number(process.env.PRICE_PER_KWH || 10),
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS || 86_400)
};

function parseAllowedOrigins(value?: string): string[] {
  if (!value) {
    return ["http://localhost:5173", "http://127.0.0.1:5173"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getOptionalEnvValue(value?: string): string | undefined {
  const normalizedValue = normalizeEnvValue(value);
  return normalizedValue || undefined;
}

function getOptionalNumberValue(value?: string): number | undefined {
  const normalizedValue = getOptionalEnvValue(value);
  return normalizedValue ? Number(normalizedValue) : undefined;
}

function normalizeEnvValue(value?: string): string {
  let normalizedValue = value?.trim() || "";

  if (normalizedValue.endsWith(",")) {
    normalizedValue = normalizedValue.slice(0, -1).trim();
  }

  const hasSingleQuotes =
    normalizedValue.startsWith("'") && normalizedValue.endsWith("'");
  const hasDoubleQuotes =
    normalizedValue.startsWith("\"") && normalizedValue.endsWith("\"");

  if (hasSingleQuotes || hasDoubleQuotes) {
    normalizedValue = normalizedValue.slice(1, -1);
  }

  return normalizedValue;
}
