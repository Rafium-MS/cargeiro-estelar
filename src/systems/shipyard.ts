// src/systems/shipyard.ts
import { gameState } from "../core/state";
import { SHIP_DEFINITIONS, ShipDefinition, getShipDefinition } from "../core/ships";
import { addLog } from "../ui/log";

const UPGRADE_BONUS = {
  hull: 20,
  cargo: 8,
  fuel: 20,
  quarters: 1
};

function applyUpgrades(ship: ShipDefinition) {
  const upgrades = gameState.upgrades;
  return {
    maxHull: ship.hull + upgrades.hull * UPGRADE_BONUS.hull,
    maxFuel: ship.fuel + upgrades.fuel * UPGRADE_BONUS.fuel,
    cargoCapacity: ship.cargo + upgrades.cargo * UPGRADE_BONUS.cargo,
    crewCapacity: ship.crew + upgrades.quarters * UPGRADE_BONUS.quarters
  };
}

export function getShipyardCatalog() {
  return SHIP_DEFINITIONS;
}

export function switchShip(shipKey: string) {
  const ship = getShipDefinition(shipKey);
  if (!ship) return;

  if (gameState.ship.key === ship.key) {
    addLog(`O ${ship.name} já é sua nave atual.`, "warning");
    return;
  }

  if (gameState.credits < ship.price) {
    addLog(`Créditos insuficientes para adquirir ${ship.name} (${ship.price} cr).`, "warning");
    return;
  }

  const upgradedStats = applyUpgrades(ship);

  gameState.credits -= ship.price;
  gameState.ship = {
    key: ship.key,
    name: ship.name,
    tier: ship.tier,
    description: ship.description,
    traits: ship.traits,
    smugglerHold: ship.smugglerHold ?? 0,
    price: ship.price,
    hull: upgradedStats.maxHull,
    maxHull: upgradedStats.maxHull,
    fuel: upgradedStats.maxFuel,
    maxFuel: upgradedStats.maxFuel,
    cargoCapacity: upgradedStats.cargoCapacity,
    cargoUsed: Math.min(gameState.ship.cargoUsed, upgradedStats.cargoCapacity)
  };

  const desiredCrewCapacity = upgradedStats.crewCapacity;
  gameState.crewCapacity = Math.max(desiredCrewCapacity, gameState.crew.length);

  addLog(`Você adquiriu o ${ship.name}! Estatísticas redefinidas com upgrades aplicados.`, "good");
}

export function getShipTraitSummary(ship: ShipDefinition): string {
  const traitText = ship.traits.join(" · ");
  if (ship.smugglerHold) {
    return `${traitText} · Espaço oculto para contrabando: +${ship.smugglerHold}u`;
  }
  return traitText;
}
