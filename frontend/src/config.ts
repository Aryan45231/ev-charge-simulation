export const config = {
  webSocketUrl: import.meta.env.VITE_WS_URL || "ws://localhost:8080",
  meterIntervalMs: Number(import.meta.env.VITE_METER_INTERVAL_MS || 60_000),
  kwhPerMinute: 1,
  pricePerKwh: 10
};
