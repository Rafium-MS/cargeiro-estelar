// src/systems/fuel.ts
import { gameState } from "../core/state";
import { addLog } from "../ui/log";

const FUEL_PRICE_PER_UNIT = 8;

export function fuelMissing() {
  return Math.max(0, gameState.ship.maxFuel - gameState.ship.fuel);
}

export function calculateRefuelCost() {
  return fuelMissing() * FUEL_PRICE_PER_UNIT;
}

export function refuelShip() {
  const missing = fuelMissing();
  if (missing === 0) {
    addLog("Tanque já está cheio. Nenhum abastecimento necessário.", "warning");
    return;
  }

  const fullCost = calculateRefuelCost();

  if (gameState.credits < FUEL_PRICE_PER_UNIT) {
    addLog("Créditos insuficientes até para um abastecimento mínimo.", "warning");
    return;
  }

  let fuelAdded = missing;
  let cost = fullCost;

  if (gameState.credits < fullCost) {
    fuelAdded = Math.floor(gameState.credits / FUEL_PRICE_PER_UNIT);
    cost = fuelAdded * FUEL_PRICE_PER_UNIT;
  }

  gameState.credits -= cost;
  gameState.ship.fuel += fuelAdded;

  addLog(
    `Abastecimento realizado: +${fuelAdded} de combustível por ${cost} cr (${FUEL_PRICE_PER_UNIT} cr/unidade).`,
    "good"
  );
}
