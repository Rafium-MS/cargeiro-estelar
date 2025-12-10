// src/core/services/log.ts
import { LogEntry } from "../models";
import { gameState } from "../state";

export function addLog(message: string, type: "" | "danger" | "warning" | "good" = "") {
  const entry: LogEntry = {
    day: gameState.day,
    message,
    type
  };

  gameState.log.unshift(entry);
}
