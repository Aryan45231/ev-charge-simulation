import mongoose from "mongoose";
import { config } from "../../config/appConfig.js";
import { logger } from "../../utils/logger.js";

export async function connectMongoDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(config.mongodbUri);
  logger.info("Connected to MongoDB", {
    database: mongoose.connection.name
  });
}

export async function closeMongoDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}
