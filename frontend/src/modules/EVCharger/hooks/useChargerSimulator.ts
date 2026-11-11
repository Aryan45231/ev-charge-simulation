import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClientMessageType,
  ServerMessageType
} from "../constants/websocketMessageTypes";
import { useWebSocketClient } from "../../../hooks/useWebSocketClient";
import { ConnectionStatus, type WebSocketMessage } from "../../../types/websocketTypes";
import type { FinalBill } from "../types/billingTypes";
import { SessionStatus } from "../types/uiTypes";
import type {
  ServerMessage,
  TransactionStartedPayload
} from "../types/websocketTypes";
import { createTransactionId } from "../utils/transaction";
import { useMeterSimulation } from "./useMeterSimulation";

const DEFAULT_DURATION_MINUTES = 5;

type SendClientMessage = (
  type: ClientMessageType,
  payload: Record<string, unknown>
) => boolean;

function calculateSessionProgress(
  durationMinutes: number,
  elapsedSeconds: number,
  sessionStatus: SessionStatus
): number {
  if (sessionStatus === SessionStatus.IDLE) {
    return 0;
  }

  const totalTargetSeconds = durationMinutes * 60;

  if (totalTargetSeconds <= 0) {
    return 0;
  }

  return Math.min((elapsedSeconds / totalTargetSeconds) * 100, 100);
}

export function useChargerSimulator() {
  const activeTransactionRef = useRef<string | null>(null);
  const sendMessageRef = useRef<SendClientMessage>(() => false);

  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MINUTES);
  const [transactionId, setTransactionId] = useState("");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(SessionStatus.IDLE);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [meterValue, setMeterValue] = useState(0);
  const [finalBill, setFinalBill] = useState<FinalBill | null>(null);
  const { resetMeter, startSimulation, stopSimulation } = useMeterSimulation();

  const { connectionStatus, sendMessage } = useWebSocketClient({
    onClose: handleSocketClose,
    onMessage(message: WebSocketMessage) {
      handleServerMessage(message as ServerMessage);
    }
  });

  const progress = useMemo(
    () => calculateSessionProgress(durationMinutes, elapsedSeconds, sessionStatus),
    [durationMinutes, elapsedSeconds, sessionStatus]
  );

  const canStart =
    connectionStatus === ConnectionStatus.CONNECTED &&
    (sessionStatus === SessionStatus.IDLE || sessionStatus === SessionStatus.COMPLETED);
  const canEnd =
    connectionStatus === ConnectionStatus.CONNECTED && sessionStatus === SessionStatus.CHARGING;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  function handleSecondTick(seconds: number, currentKwh: number): void {
    setElapsedSeconds(seconds);
    setMeterValue(currentKwh);
  }

  function handleMeterValue(_completedMinute: number, cumulativeKwh: number): void {
    const currentTransactionId = activeTransactionRef.current;

    if (!currentTransactionId) {
      return;
    }

    sendMessageRef.current(ClientMessageType.METER_VALUE, {
      transactionId: currentTransactionId,
      consumption: cumulativeKwh
    });
  }

  function endSession(): void {
    const currentTransactionId = activeTransactionRef.current;

    if (!currentTransactionId) {
      return;
    }

    stopSimulation();
    sendMessageRef.current(ClientMessageType.END_TRANSACTION, {
      transactionId: currentTransactionId
    });
    setSessionStatus(SessionStatus.ENDING);
  }

  function handleTransactionStarted(payload: TransactionStartedPayload): void {
    const isCurrentTransaction = activeTransactionRef.current === payload.transactionId;
    
    if (isCurrentTransaction) {
      startSimulation({
        durationMinutes,
        onComplete: endSession,
        onMeterValue: handleMeterValue,
        onSecondTick: handleSecondTick,
      });
    }
  }

  function handleTransactionEnded(payload: FinalBill): void {
    stopSimulation();
    setFinalBill(payload);
    setSessionStatus(SessionStatus.COMPLETED);
    activeTransactionRef.current = null;
  }

  function handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case ServerMessageType.TRANSACTION_STARTED:
        handleTransactionStarted(message.payload);
        return;
      case ServerMessageType.TRANSACTION_ENDED:
        handleTransactionEnded(message.payload);
        return;
      default:
        return;
    }
  }



  function handleSocketClose(): void {
    stopSimulation();

    if (activeTransactionRef.current) {
      setSessionStatus(SessionStatus.IDLE);
    }
  }

  function startSession(): void {
    const newTransactionId = createTransactionId();

    stopSimulation();
    resetMeter();
    activeTransactionRef.current = newTransactionId;
    setTransactionId(newTransactionId);
    setFinalBill(null);
    setElapsedSeconds(0);
    setMeterValue(0);
    setSessionStatus(SessionStatus.CHARGING);

    sendMessage(ClientMessageType.START_TRANSACTION, { transactionId: newTransactionId });
  }

  function resetToIdle(): void {
    stopSimulation();
    resetMeter();
    activeTransactionRef.current = null;
    setFinalBill(null);
    setSessionStatus(SessionStatus.IDLE);
    setElapsedSeconds(0);
    setMeterValue(0);
    setTransactionId("");
  }

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  return {
    canEnd,
    canStart,
    connectionStatus,
    durationMinutes,
    elapsedMinutes,
    elapsedSeconds,
    finalBill,
    meterValue,
    progress,
    sessionStatus,
    transactionId,
    endSession,
    resetToIdle,
    setDurationMinutes,
    startSession
  };
}
