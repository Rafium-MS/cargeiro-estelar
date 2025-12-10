// src/core/state.ts
import { MAP_LOCATIONS } from "./data";
import { ShipId, getShipDefinition } from "./ships";

const startingShip = getShipDefinition("lv01" as ShipId)!;

export const gameState = {
  day: 1,
  credits: 1000,
  ship: {
    key: startingShip.key,
    name: startingShip.name,
    tier: startingShip.tier,
    description: startingShip.description,
    traits: startingShip.traits,
    smugglerHold: startingShip.smugglerHold ?? 0,
    price: startingShip.price,
    hull: startingShip.hull,
    maxHull: startingShip.hull,
    fuel: startingShip.fuel,
    maxFuel: startingShip.fuel,
    cargoCapacity: startingShip.cargo,
    cargoUsed: 0
  },
  location: "Estação Alfa-3",
  jobs: [] as any[],
  log: [] as any[],
  crew: [] as any[],
  crewCapacity: startingShip.crew,
  crewCandidates: [] as any[],
  upgrades: {
    hull: 0,
    cargo: 0,
    fuel: 0,
    quarters: 0
  },
  reputation: {
    authorities: 0,
    corporations: 0,
    syndicate: 0
  },
  storyFlags: {
    authMission1: false,
    authMission1Complete: false,
    authMission2: false,
    authMission2Complete: false,
    corpMission1: false,
    corpMission1Complete: false,
    corpMission2: false,
    corpMission2Complete: false,
    syndMission1: false,
    syndMission1Complete: false,
    syndMission2: false,
    syndMission2Complete: false
  },
  missionHistory: [] as any[]
};

export const LOCATIONS = MAP_LOCATIONS.map(l => l.name);

export function getLocationData(name: string) {
  return MAP_LOCATIONS.find(l => l.name === name)!;
}

export function distanceBetween(aName: string, bName: string): number {
  const a = getLocationData(aName);
  const b = getLocationData(bName);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
}
