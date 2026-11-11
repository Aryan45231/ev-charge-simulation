import mongoose, { Schema, type InferSchemaType } from "mongoose";

const meterReadingSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    consumption: {
      type: Number,
      required: true,
      min: 0
    },
    recordedAt: {
      type: Date,
      required: true
    }
  },
  {
    collection: "meter_readings",
    timestamps: true
  }
);

meterReadingSchema.index({ transactionId: 1, recordedAt: 1 });
meterReadingSchema.index({ recordedAt: -1 });

export type MeterReadingDocument = InferSchemaType<typeof meterReadingSchema>;

export const MeterReadingModel =
  mongoose.models.MeterReading || mongoose.model("MeterReading", meterReadingSchema);
