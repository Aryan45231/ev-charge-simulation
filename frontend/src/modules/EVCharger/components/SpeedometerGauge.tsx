import { SessionStatus } from "../types/uiTypes";

interface SpeedometerGaugeProps {
  meterValue: number;
  targetKwh: number;
  progress: number;
  sessionStatus: SessionStatus;
}

export function SpeedometerGauge({
  meterValue,
  targetKwh,
  progress,
  sessionStatus
}: SpeedometerGaugeProps) {
  const isCharging = sessionStatus === SessionStatus.CHARGING;
  const isCompleted = sessionStatus === SessionStatus.COMPLETED;

  // Speedometer dimensions & geometry (240 degree arc from 150 deg to 390 deg)
  const size = 260;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2 - 10;
  const center = size / 2;
  
  // Total arc angle = 240 degrees (4.18879 radians)
  const startAngle = 150; // In degrees
  const totalAngle = 240;
  const currentAngle = startAngle + (Math.min(progress, 100) / 100) * totalAngle;

  const circumference = 2 * Math.PI * radius;
  const arcLength = (totalAngle / 360) * circumference;
  const strokeDashoffset = arcLength - (arcLength * Math.min(progress, 100)) / 100;

  // Needle calculation
  const needleAngleRad = (currentAngle * Math.PI) / 180;
  const needleLength = radius - 18;
  const needleX = center + needleLength * Math.cos(needleAngleRad);
  const needleY = center + needleLength * Math.sin(needleAngleRad);

  // Speedometer tick marks
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className={`panel speedometer-card ${sessionStatus}`} aria-label="Speedometer Charge Progress">
      <div className="speedometer-header">
        <div className="speedometer-badge">
          <span className={`speedo-dot ${isCharging ? "active" : ""}`} />
          <span>{isCharging ? "Charging Active" : isCompleted ? "Charge Complete" : "Standby"}</span>
        </div>
        <div className="speedo-target">
          Goal: <strong className="font-mono">{targetKwh.toFixed(1)} kWh</strong>
        </div>
      </div>

      <div className="speedometer-visual-wrap">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="speedometer-svg"
        >
          <defs>
            <linearGradient id="speedoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <filter id="speedoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
          />

          {/* Dynamic Charge Progress Arc */}
          <circle
            className={`speedo-progress-arc ${isCharging ? "pulse-glow" : ""}`}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#speedoGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#speedoGlow)"
            transform={`rotate(${startAngle} ${center} ${center})`}
            style={{
              transition: "stroke-dashoffset 0.4s ease-out"
            }}
          />

          {/* Speedometer Tick Marks */}
          {ticks.map((percent) => {
            const angle = startAngle + (percent / 100) * totalAngle;
            const rad = (angle * Math.PI) / 180;
            const tickInnerR = radius - 16;
            const tickOuterR = radius - 8;
            const x1 = center + tickInnerR * Math.cos(rad);
            const y1 = center + tickInnerR * Math.sin(rad);
            const x2 = center + tickOuterR * Math.cos(rad);
            const y2 = center + tickOuterR * Math.sin(rad);

            const labelR = radius - 26;
            const lx = center + labelR * Math.cos(rad);
            const ly = center + labelR * Math.sin(rad);

            return (
              <g key={percent}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={percent <= progress ? "#10b981" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth="2"
                />
                <text
                  x={lx}
                  y={ly + 3}
                  fontSize="8"
                  textAnchor="middle"
                  fill={percent <= progress ? "rgba(16, 185, 129, 0.9)" : "rgba(255, 255, 255, 0.35)"}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {percent}
                </text>
              </g>
            );
          })}

          {/* Speedometer Needle */}
          <g style={{ transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <line
              x1={center}
              y1={center}
              x2={needleX}
              y2={needleY}
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Needle Pivot Center Orb */}
            <circle cx={center} cy={center} r="6" fill="#080b11" stroke="#10b981" strokeWidth="2.5" />
            <circle cx={center} cy={center} r="2.5" fill="#34d399" />
          </g>
        </svg>

        {/* Center Speedometer Readout */}
        <div className="speedometer-center-content">
          <span className="speedo-eyebrow">ENERGY METER</span>
          <div className="speedo-number-row">
            <strong className="speedo-number font-mono">{meterValue.toFixed(2)}</strong>
            <span className="speedo-unit font-mono">kWh</span>
          </div>
          <div className="speedo-progress-chip font-mono">
            {Math.round(progress)}% of Goal
          </div>
        </div>
      </div>

      {/* Speedometer Sub-metrics Footer */}
      <div className="speedo-footer-row">
        <div className="speedo-footer-item">
          <span className="footer-item-label">POWER FLOW</span>
          <strong className="footer-item-val font-mono">{isCharging ? "60.0 kW" : "0.0 kW"}</strong>
        </div>
        <div className="speedo-footer-divider" />
        <div className="speedo-footer-item">
          <span className="footer-item-label">RATE</span>
          <strong className="footer-item-val font-mono">{isCharging ? "1.0 kWh/m" : "0.0 kWh/m"}</strong>
        </div>
      </div>
    </div>
  );
}
