export interface FinalBill {
  transactionId: string;
  firstMeterValue: number;
  lastMeterValue: number;
  energyConsumedKwh: number;
  pricePerKwh: number;
  totalCost: number;
  startedAt: string;
  endedAt: string;
}
