// src/core/models.ts
import type { CargoTypeDefinition } from "./dataLoader";
import { ShipId } from "./ships";

export type FactionKey = "authorities" | "corporations" | "syndicate";

export type Reputation = Record<FactionKey, number>;

export type UpgradeType = "hull" | "cargo" | "fuel" | "quarters";

export type UpgradeState = Record<UpgradeType, number>;

export type ProgressionState = {
  unlockedShips: string[];
  unlockedUpgrades: string[];
  milestonesCompleted: string[];
};

export type Ship = {
  key: ShipId;
  name: string;
  tier: number;
  description: string;
  traits: string[];
  smugglerHold?: number;
  price: number;
  hull: number;
  maxHull: number;
  fuel: number;
  maxFuel: number;
  cargoCapacity: number;
  cargoUsed: number;
};

export type CrewEffect = {
  key: string;
  name: string;
  type: "buff" | "debuff";
  description: string;
  riskMod?: number;
  fuelPercent?: number;
  hullDamagePercent?: number;
  fatigueFlat?: number;
  bonusRoll?: number;
  skillBonus?: Partial<Record<"pilot" | "engineer" | "security" | "logistics", number>>;
};

export type CrewMember = {
  id: string;
  name: string;
  role: string;
  key: "pilot" | "engineer" | "security" | "logistics";
  skill: number;
  salaryPerDay: number;
  morale: number;
  fatigue: number;
  effects?: CrewEffect[];
};

export type CargoType = CargoTypeDefinition;

export type Job = {
  id: string;
  origin: string;
  destination: string;
  cargoAmount: number;
  basePay: number;
  pay: number;
  fuelCost: number;
  riskBase: number;
  cargoType: CargoType;
  distance: number;
  originZone: string;
  destinationZone: string;
  clientFactionKey: FactionKey;
  clientFactionName: string;
  clientFactionShort: string;
  isStory: boolean;
  storyId?: string;
  storyTitle?: string;
  storySummary?: string;
  completed?: boolean;
};

export type LogEntry = {
  day: number;
  message: string;
  type: "" | "danger" | "warning" | "good";
};

export type StoryFlags = {
  authMission1: boolean;
  authMission1Complete: boolean;
  authMission2: boolean;
  authMission2Complete: boolean;
  corpMission1: boolean;
  corpMission1Complete: boolean;
  corpMission2: boolean;
  corpMission2Complete: boolean;
  syndMission1: boolean;
  syndMission1Complete: boolean;
  syndMission2: boolean;
  syndMission2Complete: boolean;
};

export type MissionHistoryEntry = {
  id: string;
  title: string;
  factionKey: string;
  kind: "normal" | "especial";
  reward: number;
  day: number;
  status: "success" | "partial" | "failure";
};

export type GameState = {
  day: number;
  credits: number;
  ship: Ship;
  location: string;
  jobs: Job[];
  log: LogEntry[];
  crew: CrewMember[];
  crewCapacity: number;
  crewCandidates: CrewMember[];
  upgrades: UpgradeState;
  reputation: Reputation;
  storyFlags: StoryFlags;
  missionHistory: MissionHistoryEntry[];
  progression: ProgressionState;
};
