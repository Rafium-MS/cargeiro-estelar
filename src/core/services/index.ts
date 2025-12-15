// src/core/services/index.ts
import { gameState } from "../state";
import { ActionResult, StateListener } from "./types";
import { acceptJob, generateJobs } from "../../systems/jobs";
import { fireCrew, generateCrewCandidates, hireCrew, rest } from "../../systems/crew";
import { refuelShip } from "../../systems/fuel";
import { switchShip } from "../../systems/shipyard";
import { addLog } from "./log";
import { UpgradeType } from "../models";
import { persistGameState } from "../dataLoader";
import { evaluateMilestones } from "../../systems/progression";

type GameListener = StateListener<typeof gameState>;

const listeners: GameListener[] = [];

function notify() {
  evaluateMilestones();
  listeners.forEach(listener => listener(gameState));
  persistGameState(gameState);
}

function runWithNotification(action: () => ActionResult): ActionResult {
  const result = action();
  notify();
  return result;
}

function upgradeShip(type: UpgradeType): ActionResult {
  const level = gameState.upgrades[type] || 0;

  const baseCosts: Record<string, number> = {
    hull: 500,
    cargo: 400,
    fuel: 450,
    quarters: 600
  };

  const perLevel = 250;
  const cost = baseCosts[type] + level * perLevel;

  if (gameState.credits < cost) {
    addLog(`Créditos insuficientes para o upgrade "${type}".`, "warning");
    return { success: false, error: "Créditos insuficientes" };
  }

  gameState.credits -= cost;
  gameState.upgrades[type] = (gameState.upgrades[type] || 0) + 1;

  if (type === "hull") {
    gameState.ship.maxHull += 20;
    gameState.ship.hull = gameState.ship.maxHull;
  } else if (type === "cargo") {
    gameState.ship.cargoCapacity += 8;
  } else if (type === "fuel") {
    gameState.ship.maxFuel += 20;
    gameState.ship.fuel = gameState.ship.maxFuel;
  } else if (type === "quarters") {
    gameState.crewCapacity += 1;
  }

  return { success: true };
}

export const gameServices = {
  subscribe(listener: GameListener) {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },
  getState() {
    return gameState;
  },
  actions: {
    generateJobs: () => runWithNotification(generateJobs),
    generateCrewCandidates: () => runWithNotification(generateCrewCandidates),
    rest: () => runWithNotification(rest),
    refuelShip: () => runWithNotification(refuelShip),
    acceptJob: (id: string) => runWithNotification(() => acceptJob(id)),
    hireCrew: (id: string) => runWithNotification(() => hireCrew(id)),
    fireCrew: (id: string) => runWithNotification(() => fireCrew(id)),
    switchShip: (shipKey: string) => runWithNotification(() => switchShip(shipKey)),
    upgradeShip: (type: UpgradeType) => runWithNotification(() => upgradeShip(type))
  }
};
