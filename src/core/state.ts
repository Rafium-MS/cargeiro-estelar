// src/core/state.ts
import { MAP_LOCATIONS } from "./data";
import { loadPersistedGameState } from "./dataLoader";
import { GameState, ProgressionState, Reputation, Ship, StoryFlags, UpgradeState } from "./models";
import { LOCATIONS, getLocationData } from "./map";
import { SHIPS, ShipId, getShipDefinition } from "./ships";

const startingShipDef = getShipDefinition("lv01" as ShipId)!;

const createShipState = (): Ship => ({
  key: startingShipDef.key,
  name: startingShipDef.name,
  tier: startingShipDef.tier,
  description: startingShipDef.description,
  traits: startingShipDef.traits,
  smugglerHold: startingShipDef.smugglerHold ?? 0,
  price: startingShipDef.price,
  hull: startingShipDef.hull,
  maxHull: startingShipDef.hull,
  fuel: startingShipDef.fuel,
  maxFuel: startingShipDef.fuel,
  cargoCapacity: startingShipDef.cargo,
  cargoUsed: 0
});

const startingUpgrades: UpgradeState = {
  hull: 0,
  cargo: 0,
  fuel: 0,
  quarters: 0
};

const startingUnlockedShips: ShipId[] = Array.from(
  new Set(
    SHIPS.filter(ship => ship.default).map(ship => ship.id as ShipId).concat(startingShipDef.key)
  )
);

const startingProgression: ProgressionState = {
  unlockedShips: startingUnlockedShips,
  unlockedUpgrades: ["hull", "cargo", "fuel", "quarters"],
  milestonesCompleted: []
};

const startingReputation: Reputation = {
  authorities: 0,
  corporations: 0,
  syndicate: 0
};

const startingStoryFlags: StoryFlags = {
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
};

const baseGameState: GameState = {
  day: 1,
  credits: 1000,
  ship: createShipState(),
  location: "Estação Alfa-3",
  jobs: [],
  log: [],
  crew: [],
  crewCapacity: startingShipDef.crew,
  crewCandidates: [],
  upgrades: startingUpgrades,
  reputation: startingReputation,
  storyFlags: startingStoryFlags,
  missionHistory: [],
  progression: startingProgression
};

const persistedGameState = loadPersistedGameState();

export const gameState: GameState = persistedGameState
  ? { ...baseGameState, ...persistedGameState }
  : baseGameState;

export { LOCATIONS, MAP_LOCATIONS, getLocationData };
