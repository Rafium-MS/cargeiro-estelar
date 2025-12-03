// src/systems/missionHistory.ts
import { gameState } from "../core/state";

export function registerMissionCompletion(payload: {
  id: string;
  title: string;
  factionKey: string;
  kind: "normal" | "especial";
  reward: number;
  day: number;
}) {
  gameState.missionHistory.push(payload);
}

export function getMissionHistory() {
  return gameState.missionHistory;
}
