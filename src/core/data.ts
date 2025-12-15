// src/core/data.ts
import { getStaticData } from "./dataLoader";

const { mapLocations, factions, crewRoles, namePool, cargoTypes } = getStaticData();

export const MAP_LOCATIONS = mapLocations;
export const FACTIONS = factions;
export const ROLES = crewRoles;
export const NAME_POOL = namePool;
export const CARGO_TYPES = cargoTypes;

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function chooseRandom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function repStatus(value: number): string {
  if (value <= -60) return "Hostil";
  if (value <= -20) return "Desconfiado";
  if (value < 20) return "Neutro";
  if (value < 50) return "Amigável";
  return "Aliado";
}

export function zoneRiskModifier(zone: string): number {
  if (zone === "Zona de Piratas") return 20;
  if (zone === "Zona de Fiscalização") return 10;
  if (zone === "Fronteira") return 5;
  return 0;
}
