// src/systems/missionHistory.ts
import { gameState } from "../core/state";

export function registerMissionCompletion(payload: {
  id: string;
  title: string;
  factionKey: string;
  kind: "normal" | "especial";
  reward: number;
  day: number;
  status?: "success" | "partial" | "failure";
}) {
  gameState.missionHistory.push({
    ...payload,
    status: payload.status ?? "success"
  });
}

export function getMissionHistory() {
  return gameState.missionHistory;
}
