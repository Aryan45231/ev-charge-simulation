import { ConnectionStatus } from "../../../types/websocketTypes";

interface HeaderPanelProps {
  connectionStatus: ConnectionStatus;
}

export function HeaderPanel({ connectionStatus }: HeaderPanelProps) {
  return (
    <header className="panel header-panel" aria-label="EV Charger Header">
      <div className="header-brand-wrap">
        <div className="station-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <div>
          <div className="header-eyebrow-row">
            <span className="eyebrow-tag">STATION #EV-PULSE-01</span>
            <span className="eyebrow-sub">CCS2 Fast DC • 60 kW Max</span>
          </div>
          <h1 className="header-main-title">EV Charging Simulator</h1>
        </div>
      </div>

      <div className="header-status-group">
        <div className="protocol-chip">
          <span className="protocol-label">PROTOCOL</span>
          <span className="protocol-val">WS / OCPP</span>
        </div>
        <div className={`connection-pill ${connectionStatus}`}>
          <span className="connection-dot" />
          <span className="connection-text">
            {connectionStatus === ConnectionStatus.CONNECTED
              ? "Grid Online"
              : connectionStatus === ConnectionStatus.CONNECTING
              ? "Connecting..."
              : "Disconnected"}
          </span>
        </div>
      </div>
    </header>
  );
}
