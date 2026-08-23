import assert from "node:assert/strict";
import test from "node:test";
import { calculateBill } from "../src/controllers/transaction/service.js";

test("calculates bill from first and latest cumulative readings", () => {
  const bill = calculateBill(
    { consumption: 1, recordedAt: "2026-08-22T12:00:00.000Z" },
    { consumption: 2.5, recordedAt: "2026-08-22T12:01:00.000Z" }
  );

  assert.deepEqual(bill, {
    firstMeterValue: 1,
    lastMeterValue: 2.5,
    energyConsumedKwh: 1.5,
    pricePerKwh: 10,
    totalCost: 15
  });
});

test("calculates one minute session bill from zero baseline", () => {
  const bill = calculateBill(
    { consumption: 0, recordedAt: "2026-08-22T12:00:00.000Z" },
    { consumption: 1, recordedAt: "2026-08-22T12:01:00.000Z" }
  );

  assert.equal(bill.energyConsumedKwh, 1);
  assert.equal(bill.totalCost, 10);
});

test("returns zero bill when no meter reading is available", () => {
  const bill = calculateBill(null, null);

  assert.equal(bill.energyConsumedKwh, 0);
  assert.equal(bill.totalCost, 0);
});
