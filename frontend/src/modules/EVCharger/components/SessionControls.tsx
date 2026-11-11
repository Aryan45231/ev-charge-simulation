import { config } from "../../../config";
import { SessionStatus } from "../types/uiTypes";

interface SessionControlsProps {
  canEnd: boolean;
  canStart: boolean;
  durationMinutes: number;
  sessionStatus: SessionStatus;
  onDurationChange: (durationMinutes: number) => void;
  onEnd: () => void;
  onStart: () => void;
}

const PRESET_DURATIONS = [2, 5, 10, 15, 30];

export function SessionControls({
  canEnd,
  canStart,
  durationMinutes,
  sessionStatus,
  onDurationChange,
  onEnd,
  onStart
}: SessionControlsProps) {
  const isCharging = sessionStatus === SessionStatus.CHARGING;
  const isEnding = sessionStatus === SessionStatus.ENDING;

  const targetKwh = durationMinutes * config.kwhPerMinute;

  const handleCustomInput = (val: number) => {
    const safeVal = Math.min(120, Math.max(1, isNaN(val) ? 1 : Math.round(val)));
    onDurationChange(safeVal);
  };

  return (
    <div className="panel controls-panel" aria-label="Session Configuration">
      <div className="controls-topline">
        <div>
          <span className="section-eyebrow">SESSION DURATION</span>
          <h2 className="controls-title">Select Charging Time</h2>
        </div>
        <div className="rate-badge">
          <span>₹{config.pricePerKwh}/kWh Standard Tariff</span>
        </div>
      </div>

      {/* Preset Duration Chips */}
      <div className="preset-chips-row">
        {PRESET_DURATIONS.map((mins) => {
          const isSelected = durationMinutes === mins;
          return (
            <button
              key={mins}
              type="button"
              className={`preset-chip ${isSelected ? "selected" : ""}`}
              disabled={isCharging || isEnding}
              onClick={() => onDurationChange(mins)}
            >
              <span>{mins} min</span>
              <span className="chip-kwh font-mono">{mins} kWh</span>
            </button>
          );
        })}
      </div>

      {/* Custom Duration Input & Stepper */}
      <div className="custom-duration-row">
        <div className="stepper-wrap">
          <span className="input-label">Custom Duration:</span>
          <div className="stepper-box">
            <button
              type="button"
              className="stepper-btn"
              disabled={isCharging || isEnding || durationMinutes <= 1}
              onClick={() => handleCustomInput(durationMinutes - 1)}
              aria-label="Decrease minutes"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <input
              id="customDurationInput"
              type="number"
              min="1"
              max="120"
              value={durationMinutes}
              disabled={isCharging || isEnding}
              onChange={(e) => handleCustomInput(Number(e.target.value))}
              className="stepper-input font-mono"
            />
            <span className="stepper-unit">min</span>

            <button
              type="button"
              className="stepper-btn"
              disabled={isCharging || isEnding || durationMinutes >= 120}
              onClick={() => handleCustomInput(durationMinutes + 1)}
              aria-label="Increase minutes"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Range Slider for fast drag */}
        <div className="slider-container">
          <input
            id="durationSlider"
            type="range"
            min="1"
            max="60"
            step="1"
            value={Math.min(durationMinutes, 60)}
            disabled={isCharging || isEnding}
            onChange={(event) => handleCustomInput(Number(event.target.value))}
            className="custom-range"
          />
          <div className="slider-ticks">
            <span>1m</span>
            <span>15m</span>
            <span>30m</span>
            <span>45m</span>
            <span>60m</span>
          </div>
        </div>
      </div>

      {/* Target Preview */}
      <div className="target-preview-bar">
        <div className="preview-item">
          <span className="preview-label">Target Energy:</span>
          <strong className="preview-val font-mono">{targetKwh.toFixed(1)} kWh</strong>
        </div>
        <div className="preview-divider" />
        <div className="preview-item">
          <span className="preview-label">Pricing Rate:</span>
          <strong className="preview-val font-mono text-emerald">
            ₹{config.pricePerKwh} / kWh
          </strong>
        </div>
      </div>

      {/* Start / End Actions */}
      <div className="control-actions">
        <button
          type="button"
          className={`primary-button ${isCharging ? "active-charging" : ""}`}
          disabled={!canStart}
          onClick={onStart}
        >
          <span className="btn-content">
            {isCharging ? (
              <>
                <span className="spinner-orbit" />
                Charging in Progress...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Start Session
              </>
            )}
          </span>
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={!canEnd}
          onClick={onEnd}
        >
          <span className="btn-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
            {isEnding ? "Ending Session..." : "End Session"}
          </span>
        </button>
      </div>
    </div>
  );
}
