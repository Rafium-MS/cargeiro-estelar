// src/systems/economy.ts
import { randInt } from "../core/data";
import { getFuelPrice, getPortFee } from "../core/economy";
import { Job } from "../core/models";
import { gameState } from "../core/state";
import { getCrewStats } from "./crew";

export type JobEconomics = {
  payment: number;
  fuelCost: number;
  crewSalaries: number;
  portFee: number;
  maintenanceCost: number;
  netProfit: number;
};

export function estimateMaintenanceCost(job: Pick<Job, "riskBase" | "distance">): number {
  const distanceFactor = Math.max(1, Math.round(job.distance * 12));
  const riskFactor = Math.round(job.riskBase * 6);
  let maintenance = 140 + distanceFactor + riskFactor + randInt(0, 180);

  if (gameState.ship.traits.includes("manutencao_barata")) {
    maintenance = Math.round(maintenance * 0.8);
  }

  return Math.max(80, maintenance);
}

export function calculateJobEconomics(job: Job, paymentOverride?: number): JobEconomics {
  const fuelPrice = getFuelPrice(job.origin as Parameters<typeof getFuelPrice>[0]);
  const fuelCost = Math.round(job.fuelCost * fuelPrice);
  const crewSalaries = getCrewStats().salaryPerDay;
  const portFee = getPortFee(job.destinationZone as Parameters<typeof getPortFee>[0]);
  const maintenanceCost = job.maintenanceCost ?? estimateMaintenanceCost(job);
  const payment = paymentOverride ?? job.pay;
  const netProfit = payment - fuelCost - crewSalaries - portFee - maintenanceCost;

  return {
    payment,
    fuelCost,
    crewSalaries,
    portFee,
    maintenanceCost,
    netProfit
  };
}

export function applyJobEconomics(job: Job, paymentReceived: number): JobEconomics {
  const economics = calculateJobEconomics(job, paymentReceived);
  const variableCosts = economics.fuelCost + economics.portFee + economics.maintenanceCost;

  gameState.credits += paymentReceived;
  gameState.credits -= variableCosts;

  return economics;
}
