// src/core/dataLoader.ts
import shipsJson from "../data/ships.json";
import shipVisualsJson from "../data/ship_visuals.json";
import type { GameState, Job } from "./models";

export type ShipData = (typeof shipsJson)[number];
export type ShipVisualData = (typeof shipVisualsJson)[number];

export type MapLocation = {
  name: string;
  x: number;
  y: number;
  zone: string;
};

export type FactionDefinition = {
  key: "authorities" | "corporations" | "syndicate";
  name: string;
  short: string;
};

export type CrewRoleDefinition = {
  role: string;
  key: "pilot" | "engineer" | "security" | "logistics";
};

export type CargoTypeDefinition = {
  key: "legal" | "fragile" | "smuggle";
  name: string;
  descShort: string;
  descLong: string;
  riskMod: number;
  payMult: number;
};

export type StaticDataCollections = {
  ships: typeof shipsJson;
  shipVisuals: typeof shipVisualsJson;
  mapLocations: MapLocation[];
  factions: FactionDefinition[];
  crewRoles: CrewRoleDefinition[];
  cargoTypes: CargoTypeDefinition[];
  namePool: string[];
};

export type DerivedDataCollections = {
  dailyJobs: Job[];
};

const mapLocations: MapLocation[] = [
  { name: "Estação Alfa-3", x: 0,  y: 0,  zone: "Núcleo" },
  { name: "Anel Orbital de Vega", x: 4,  y: 1,  zone: "Zona de Fiscalização" },
  { name: "Porto Espacial Orion Prime", x: -3, y: 2, zone: "Núcleo" },
  { name: "Colônia Fronteira Kaelum", x: 7,  y: -2, zone: "Fronteira" },
  { name: "Entreposto Asteroidal 7-G", x: 10, y: -4, zone: "Zona de Piratas" },
  { name: "Terminal Mercante Draconis", x: 2,  y: -6, zone: "Zona de Fiscalização" },
  { name: "Plataforma Helix-9", x: -5, y: -1, zone: "Núcleo" },
  { name: "Observatório Aurora", x: -1, y: 6,  zone: "Zona de Fiscalização" },
  { name: "Ponto de Reabastecimento Kuiper", x: 9,  y: 3,  zone: "Fronteira" },
  { name: "Enclave Livre Altair", x: 5,  y: 5,  zone: "Fronteira" },
  { name: "Mina Profunda Kor-21", x: 12, y: -7, zone: "Zona de Piratas" }
];

const factions: FactionDefinition[] = [
  { key: "authorities", name: "Autoridades do Setor", short: "Autoridades" },
  { key: "corporations", name: "Mega Corporações", short: "Corporações" },
  { key: "syndicate", name: "Sindicato do Submundo", short: "Sindicato" }
];

const crewRoles: CrewRoleDefinition[] = [
  { role: "Piloto", key: "pilot" },
  { role: "Engenheiro", key: "engineer" },
  { role: "Segurança", key: "security" },
  { role: "Logística", key: "logistics" }
];

const namePool: string[] = [
  "Rhea Solari",
  "Kael Drummond",
  "Nova Ícaro",
  "Tessa Venn",
  "Jax Corvin",
  "Nilo Faris",
  "Zara Quinn",
  "Lio Rendar",
  "Mira Sol",
  "Dax Holden"
];

const cargoTypes: CargoTypeDefinition[] = [
  {
    key: "legal",
    name: "Carga Legal",
    descShort: "Legal",
    descLong: "Mercadorias registradas. Risco normal.",
    riskMod: 0,
    payMult: 1
  },
  {
    key: "fragile",
    name: "Carga Frágil",
    descShort: "Frágil",
    descLong: "Itens sensíveis. Pagam melhor, mas podem gerar prejuízos em danos.",
    riskMod: 10,
    payMult: 1.3
  },
  {
    key: "smuggle",
    name: "Contrabando",
    descShort: "Contrabando",
    descLong: "Carga ilegal. Pagamento altíssimo, risco de fiscalização pesada.",
    riskMod: 20,
    payMult: 1.8
  }
];

const staticData: StaticDataCollections = {
  ships: shipsJson,
  shipVisuals: shipVisualsJson,
  mapLocations,
  factions,
  crewRoles,
  cargoTypes,
  namePool
};

const derivedData: DerivedDataCollections = {
  dailyJobs: []
};

const STORAGE_KEY = "cargeiro-estelar:gameState";

export function getStaticData(): StaticDataCollections {
  return staticData;
}

export function getDerivedData(): DerivedDataCollections {
  return derivedData;
}

export function updateDerivedData(update: Partial<DerivedDataCollections>): void {
  Object.assign(derivedData, update);
}

export function persistGameState(state: GameState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Não foi possível salvar o estado do jogo", err);
  }
}

export function loadPersistedGameState(): GameState | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch (err) {
    console.warn("Falha ao carregar estado salvo", err);
    return null;
  }
}
