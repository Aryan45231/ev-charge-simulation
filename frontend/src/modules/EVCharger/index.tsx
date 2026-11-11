import { BillPanel } from "./components/BillPanel";
import { HeaderPanel } from "./components/HeaderPanel";
import { MetricsGrid } from "./components/MetricsGrid";
import { SessionControls } from "./components/SessionControls";
import { SessionSummary } from "./components/SessionSummary";
import { SpeedometerGauge } from "./components/SpeedometerGauge";
import { useChargerSimulator } from "./hooks/useChargerSimulator";
import { config } from "../../config";

export function EVChargerModule() {
  const simulator = useChargerSimulator();
  const targetKwh = simulator.durationMinutes * config.kwhPerMinute;

  return (
    <main className="app-shell">
      <div className="cockpit-container">
        <HeaderPanel connectionStatus={simulator.connectionStatus} />

        <div className="dashboard-grid">
          {simulator.finalBill ? (
            <BillPanel
              finalBill={simulator.finalBill}
              onNewSession={simulator.resetToIdle}
            />
          ) : (
            <>
              <div className="hero-split">
                <SpeedometerGauge
                  meterValue={simulator.meterValue}
                  targetKwh={targetKwh}
                  progress={simulator.progress}
                  sessionStatus={simulator.sessionStatus}
                />

                <SessionControls
                  canEnd={simulator.canEnd}
                  canStart={simulator.canStart}
                  durationMinutes={simulator.durationMinutes}
                  sessionStatus={simulator.sessionStatus}
                  onDurationChange={simulator.setDurationMinutes}
                  onEnd={simulator.endSession}
                  onStart={simulator.startSession}
                />
              </div>

              <MetricsGrid
                elapsedSeconds={simulator.elapsedSeconds}
                meterValue={simulator.meterValue}
              />

              <SessionSummary
                progress={simulator.progress}
                sessionStatus={simulator.sessionStatus}
                transactionId={simulator.transactionId}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
