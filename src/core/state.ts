// src/core/state.ts
import { MAP_LOCATIONS } from "./data";

export const gameState = {
  day: 1,
  credits: 1000,
  ship: {
    name: "Cargueiro LV-01",
    hull: 100,
    maxHull: 100,
    fuel: 100,
    maxFuel: 100,
    cargoCapacity: 20,
    cargoUsed: 0
  },
  location: "Estação Alfa-3",
  jobs: [] as any[],
  log: [] as any[],
  crew: [] as any[],
  crewCapacity: 3,
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
    corpMission1: false,
    syndMission1: false
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
