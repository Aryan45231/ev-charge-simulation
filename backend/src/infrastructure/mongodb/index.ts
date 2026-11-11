export const MongoCollectionName = {
  TRANSACTIONS: "transactions",
  METER_READINGS: "meter_readings"
} as const;

export {
  closeMongoDatabase,
  connectMongoDatabase
} from "./mongodbClient.js";
export {
  TransactionModel,
  type TransactionDocument
} from "./schemas/transactionSchema.js";
export {
  MeterReadingModel,
  type MeterReadingDocument
} from "./schemas/meterReadingSchema.js";
