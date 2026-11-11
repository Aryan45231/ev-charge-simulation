import { SessionStatus } from "../types/uiTypes";

interface SessionSummaryProps {
  progress: number;
  sessionStatus: SessionStatus;
  transactionId: string;
}

export function SessionSummary({
  progress,
  sessionStatus,
  transactionId
}: SessionSummaryProps) {
  return (
    <div className="panel session-panel" aria-label="Session Summary">
      <div className="session-topline">
        <div className="tx-info">
          <span className="section-eyebrow">TRANSACTION ID</span>
          <strong className="font-mono tx-id">
            {transactionId || "Not started"}
          </strong>
        </div>
        <div className={`status-pill ${sessionStatus}`}>
          <span className="status-indicator-dot" />
          <span className="status-text">{sessionStatus}</span>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-header">
          <span>Target Progress</span>
          <strong className="font-mono">{Math.round(progress)}%</strong>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${
              sessionStatus === SessionStatus.CHARGING ? "charging-active" : ""
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
