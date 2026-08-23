import mongoose from "mongoose";
import { config } from "../../config/appConfig.js";
import { logger } from "../../utils/logger.js";

export async function connectMongoDatabase(): Promise<void> {
  await mongoose.connect(config.mongodbUri);
  logger.info("Connected to MongoDB", {
    database: mongoose.connection.name
  });
}

export async function closeMongoDatabase(): Promise<void> {
  await mongoose.disconnect();
}
