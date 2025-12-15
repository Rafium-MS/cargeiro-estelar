// src/core/economy.ts
import { MapLocation } from "./dataLoader";

export type LocationId = MapLocation["name"];
export type ZoneType = MapLocation["zone"];

type EconomyTables = {
  fuelPriceByLocation: Record<LocationId, number>;
  portFeesByZone: Record<ZoneType, number>;
};

const economy: EconomyTables = {
  fuelPriceByLocation: {
    "Estação Alfa-3": 8,
    "Anel Orbital de Vega": 9,
    "Porto Espacial Orion Prime": 7,
    "Colônia Fronteira Kaelum": 11,
    "Entreposto Asteroidal 7-G": 12,
    "Terminal Mercante Draconis": 10,
    "Plataforma Helix-9": 7,
    "Observatório Aurora": 9,
    "Ponto de Reabastecimento Kuiper": 13,
    "Enclave Livre Altair": 10,
    "Mina Profunda Kor-21": 14
  },
  portFeesByZone: {
    Núcleo: 120,
    "Zona de Fiscalização": 160,
    Fronteira: 90,
    "Zona de Piratas": 140
  }
};

export function getFuelPrice(location: LocationId): number {
  return economy.fuelPriceByLocation[location] ?? 8;
}

export function getPortFee(zone: ZoneType): number {
  return economy.portFeesByZone[zone] ?? 100;
}

export function getEconomyTables(): EconomyTables {
  return economy;
}
