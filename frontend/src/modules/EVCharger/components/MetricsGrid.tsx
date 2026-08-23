import { config } from "../../../config";

interface MetricsGridProps {
  elapsedSeconds: number;
  meterValue: number;
}

export function MetricsGrid({ elapsedSeconds, meterValue }: MetricsGridProps) {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="metrics-grid" aria-label="Charging Metrics">
      <div className="panel metric-card">
        <div className="metric-header">
          <span className="metric-label">CUMULATIVE METER</span>
          <div className="metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </div>
        <strong className="metric-value font-mono">{meterValue.toFixed(2)} kWh</strong>
        <span className="metric-sub">Energy Delivered</span>
      </div>

      <div className="panel metric-card">
        <div className="metric-header">
          <span className="metric-label">ELAPSED TIME</span>
          <div className="metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>
        <strong className="metric-value font-mono">{timeFormatted}</strong>
        <span className="metric-sub">Session Duration (MM:SS)</span>
      </div>

      <div className="panel metric-card">
        <div className="metric-header">
          <span className="metric-label">TARIFF RATE</span>
          <div className="metric-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 6v2m0 8v2" />
            </svg>
          </div>
        </div>
        <strong className="metric-value font-mono text-emerald">
          ₹{config.pricePerKwh} / kWh
        </strong>
        <span className="metric-sub">Final cost in bill on completion</span>
      </div>
    </div>
  );
}
