export const RedisKeys = {
  transaction(transactionId: string): string {
    return `transaction:${transactionId}`;
  },

  meterReadings(transactionId: string): string {
    return `transaction:${transactionId}:meter-readings`;
  },

  activeTransactions(): string {
    return "transactions:active";
  }
};
