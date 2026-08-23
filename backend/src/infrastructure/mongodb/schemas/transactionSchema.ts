import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { TransactionStatus } from "../../../constants/messageTypes.js";

const transactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      default: TransactionStatus.ACTIVE
    },
    pricePerKwh: {
      type: Number,
      required: true,
      min: 0
    },
    startedAt: {
      type: Date,
      required: true
    },
    endedAt: {
      type: Date,
      default: null
    },
    firstMeterValue: {
      type: Number,
      default: null,
      min: 0
    },
    lastMeterValue: {
      type: Number,
      default: null,
      min: 0
    },
    totalCost: {
      type: Number,
      default: null,
      min: 0
    }
  },
  {
    collection: "transactions",
    timestamps: true
  }
);

transactionSchema.index({ status: 1, startedAt: -1 });
transactionSchema.index({ endedAt: -1 });

export type TransactionDocument = InferSchemaType<typeof transactionSchema>;

export const TransactionModel =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
