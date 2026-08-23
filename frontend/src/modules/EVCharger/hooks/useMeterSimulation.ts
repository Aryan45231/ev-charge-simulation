import { useCallback, useRef } from "react";
import { config } from "../../../config";

interface StartSimulationOptions {
  durationMinutes: number;
  onComplete: () => void;
  onMeterValue: (nextMinute: number, nextMeterValue: number) => void;
  onSecondTick: (elapsedSeconds: number, currentKwh: number) => void;
}

export function useMeterSimulation() {
  const tickTimerRef = useRef<number | null>(null);
  const elapsedSecondsRef = useRef(0);

  const resetMeter = useCallback((): void => {
    elapsedSecondsRef.current = 0;
  }, []);

  const stopSimulation = useCallback((): void => {
    if (tickTimerRef.current) {
      window.clearInterval(tickTimerRef.current);
    }
    tickTimerRef.current = null;
  }, []);

  const startSimulation = useCallback(({
    durationMinutes,
    onComplete,
    onMeterValue,
    onSecondTick
  }: StartSimulationOptions): void => {
    stopSimulation();
    elapsedSecondsRef.current = 0;

    // Initial tick at 0
    onSecondTick(0, 0);
    onMeterValue(0, 0);

    const totalTargetSeconds = Math.max(durationMinutes * 60, 1);

    function handleMeterTick(): void {
      elapsedSecondsRef.current += 1;
      const currentSeconds = elapsedSecondsRef.current;

      // Calculate continuous real-time kWh (1 kWh per minute = 1/60 kWh per second)
      const currentKwh = Number(((currentSeconds / 60) * config.kwhPerMinute).toFixed(3));
      onSecondTick(currentSeconds, currentKwh);

      // Emit cumulative meter value to server on every minute boundary
      if (currentSeconds % 60 === 0) {
        const completedMinutes = Math.floor(currentSeconds / 60);
        const cumulativeKwh = completedMinutes * config.kwhPerMinute;
        onMeterValue(completedMinutes, cumulativeKwh);
      }

      // Check if session reaches configured duration
      if (currentSeconds >= totalTargetSeconds) {
        stopSimulation();
        onComplete();
      }
    }

    tickTimerRef.current = window.setInterval(handleMeterTick, 1000);
  }, [stopSimulation]);

  return {
    resetMeter,
    startSimulation,
    stopSimulation
  };
}
