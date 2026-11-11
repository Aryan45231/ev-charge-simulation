import type { FinalBill } from "../types/billingTypes";
import { formatCurrency } from "../utils/currency";

interface BillPanelProps {
  finalBill: FinalBill;
  onNewSession: () => void;
}

export function BillPanel({ finalBill, onNewSession }: BillPanelProps) {
  return (
    <div className="panel bill-panel" aria-label="Final Bill Receipt">
      <div className="bill-header">
        <div className="bill-title-wrap">
          <span className="section-eyebrow">SESSION COMPLETED</span>
          <h2 className="bill-title">Final Charging Bill</h2>
        </div>
        <div className="bill-tag">PAID</div>
      </div>

      <div className="bill-meta-row">
        <div className="bill-meta-item">
          <span className="meta-label">TRANSACTION ID</span>
          <span className="meta-val font-mono">{finalBill.transactionId}</span>
        </div>
        <div className="bill-meta-item">
          <span className="meta-label">START TIME</span>
          <span className="meta-val">
            {finalBill.startedAt ? new Date(finalBill.startedAt).toLocaleTimeString() : "N/A"}
          </span>
        </div>
        <div className="bill-meta-item">
          <span className="meta-label">END TIME</span>
          <span className="meta-val">
            {finalBill.endedAt ? new Date(finalBill.endedAt).toLocaleTimeString() : "N/A"}
          </span>
        </div>
      </div>

      <div className="bill-highlight-grid">
        <div className="bill-highlight-card">
          <span className="highlight-label">TOTAL ENERGY DELIVERED</span>
          <strong className="highlight-val font-mono">
            {finalBill.energyConsumedKwh.toFixed(2)} kWh
          </strong>
          <span className="highlight-sub">
            Meter: {finalBill.firstMeterValue.toFixed(1)} to {finalBill.lastMeterValue.toFixed(1)} kWh
          </span>
        </div>

        <div className="bill-highlight-card cost-card">
          <span className="highlight-label">FINAL CHARGE AMOUNT</span>
          <strong className="highlight-val font-mono text-emerald">
            {formatCurrency(finalBill.totalCost)}
          </strong>
          <span className="highlight-sub">
            Tariff Rate: ₹{finalBill.pricePerKwh || 10}/kWh
          </span>
        </div>
      </div>

      <div className="bill-calculation-formula">
        <span className="formula-label">CALCULATION FORMULA:</span>
        <span className="formula-val font-mono">
          ({finalBill.lastMeterValue.toFixed(2)} kWh - {finalBill.firstMeterValue.toFixed(2)} kWh) × ₹{finalBill.pricePerKwh || 10} = {formatCurrency(finalBill.totalCost)}
        </span>
      </div>

      <div className="bill-action-wrap">
        <button
          type="button"
          className="primary-button recharge-button"
          onClick={onNewSession}
        >
          <span className="btn-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Start New Session / Recharge
          </span>
        </button>
      </div>
    </div>
  );
}
