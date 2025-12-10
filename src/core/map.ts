// src/core/map.ts
import { MAP_LOCATIONS } from "./data";

export const LOCATIONS = MAP_LOCATIONS.map(location => location.name);

export function getLocationData(name: string) {
  return MAP_LOCATIONS.find(location => location.name === name)!;
}

export function distanceBetween(aName: string, bName: string): number {
  const a = getLocationData(aName);
  const b = getLocationData(bName);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
}
