// src/systems/jobs.ts
import { CARGO_TYPES, randInt, chooseRandom, zoneRiskModifier } from "../core/data";
import { CrewMember, Job } from "../core/models";
import { LOCATIONS, getLocationData, distanceBetween } from "../core/map";
import { gameState } from "../core/state";
import { addLog } from "../ui/log";
import {
  getCrewStats,
  adjustCrewMoraleRange,
  adjustCrewFatigueAll,
  checkMoraleEvents,
  getCrewEffectModifiers
} from "./crew";
import { applyTravelEvent } from "./events";
import { factionPayMultiplier } from "./story";
import { runStoryMissionOutcome } from "./story";

function pickCargoTypeWeighted() {
  const roll = randInt(1, 100);
  if (roll <= 55) return CARGO_TYPES[0];
  if (roll <= 80) return CARGO_TYPES[1];
  return CARGO_TYPES[2];
}

function pickFactionWeighted(originZone: string, destZone: string, cargoKey: string) {
  let wAuth = 1;
  let wCorp = 2;
  let wSyn = 1;

  const zones = [originZone, destZone];
  if (zones.includes("Zona de Fiscalização")) wAuth += 2;
  if (zones.includes("Zona de Piratas")) wSyn += 3;
  if (zones.includes("Fronteira")) wSyn += 1;

  if (cargoKey === "smuggle") wSyn += 3;
  if (cargoKey === "fragile") wCorp += 1;

  const rep = gameState.reputation;
  if (rep.authorities > 30) wAuth += 1;
  if (rep.corporations > 30) wCorp += 1;
  if (rep.syndicate > 30) wSyn += 1;
  if (rep.syndicate < -20) wSyn -= 1;

  if (wAuth < 0) wAuth = 0;
  if (wCorp < 0) wCorp = 0;
  if (wSyn < 0) wSyn = 0;

  const total = wAuth + wCorp + wSyn || 1;
  const roll = randInt(1, total);
  if (roll <= wAuth) return "authorities";
  if (roll <= wAuth + wCorp) return "corporations";
  return "syndicate";
}

export function generateJobs() {
  const storyJobs = gameState.jobs.filter(j => j.isStory && !j.completed);
  const jobs: Job[] = [...storyJobs];

  for (let i = 0; i < 4; i++) {
    const origin = gameState.location;
    const destination = chooseRandom(LOCATIONS.filter(l => l !== origin));
    const originData = getLocationData(origin);
    const destData = getLocationData(destination);

    const distance = distanceBetween(origin, destination);
    const cargoAmount = randInt(4, 16);
    const cargoType = pickCargoTypeWeighted();

    const clientFactionKey = pickFactionWeighted(originData.zone, destData.zone, cargoType.key);
    const basePay = cargoAmount * randInt(60, 120);
    const payMultCargo = cargoType.payMult;
    const payMultFaction = factionPayMultiplier(clientFactionKey);
    const pay = Math.round(basePay * payMultCargo * payMultFaction);

    let fuelCost = 4 + Math.round(distance * 2) + randInt(0, 4);
    if (fuelCost < 5) fuelCost = 5;

    let riskBase = randInt(5, 40) + cargoType.riskMod;
    riskBase += zoneRiskModifier(originData.zone);
    riskBase += zoneRiskModifier(destData.zone);

    const rep = gameState.reputation;
    riskBase -= rep.authorities * 0.1;
    riskBase -= rep.syndicate * 0.05;

    if (riskBase > 100) riskBase = 100;
    if (riskBase < 1) riskBase = 1;

    jobs.push({
      id: Date.now() + "_" + i + "_" + Math.random().toString(16).slice(2),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost,
      riskBase: Math.round(riskBase),
      cargoType,
      distance,
      originZone: originData.zone,
      destinationZone: destData.zone,
      clientFactionKey,
      clientFactionName: "",
      clientFactionShort:
        clientFactionKey === "authorities" ? "Autoridades" :
        clientFactionKey === "corporations" ? "Corporações" :
        "Sindicato",
      isStory: false
    });
  }

  gameState.jobs = jobs;
}

export function acceptJob(jobId: string) {
  const job = gameState.jobs.find(j => j.id === jobId);
  if (!job) return;

  const effectMods = getCrewEffectModifiers();
  const effectiveFuelCost = Math.max(1, Math.round(job.fuelCost * (1 + (effectMods.fuelPercent ?? 0) / 100)));

  if (gameState.ship.fuel < effectiveFuelCost) {
    addLog("Combustível insuficiente para essa rota. Abasteça ou escolha um trabalho mais perto.", "warning");
    return;
  }

  if (job.cargoAmount > gameState.ship.cargoCapacity) {
    addLog("Sua nave não tem capacidade de carga suficiente para esse trabalho.", "warning");
    return;
  }

  const crewStats = getCrewStats();

  if (crewStats.salaryPerDay > 0) {
    gameState.credits -= crewStats.salaryPerDay;
    addLog(
      `Salários pagos à tripulação: ${crewStats.salaryPerDay} créditos.`,
      gameState.credits < 0 ? "warning" : ""
    );

    if (gameState.credits < 0) {
      adjustCrewMoraleRange(-4, -2);
      addLog("Os rumores de atraso financeiro deixaram a tripulação preocupada.", "warning");
    }
  }

  const adjustedRiskBase = Math.max(1, Math.min(100, Math.round(job.riskBase + (effectMods.riskMod ?? 0))));

  const travelingJob = { ...job, fuelCost: effectiveFuelCost, riskBase: adjustedRiskBase };

  gameState.ship.fuel -= effectiveFuelCost;
  gameState.location = travelingJob.destination;
  gameState.day += 1;

  if (gameState.crew.length > 0) {
    gameState.crew.forEach((member: CrewMember) => {
      const baseFatigue = 6;
      const distanceFactor = Math.floor(job.distance);
      const riskFactor = Math.floor(adjustedRiskBase / 40);
      const fatigueFromEffects = effectMods.fatigueFlat ?? 0;
      member.fatigue = Math.min(100, member.fatigue + baseFatigue + distanceFactor + riskFactor + fatigueFromEffects);
    });
  }

  if (job.isStory) {
    addLog(
      `MISSÃO ESPECIAL – ${job.storyTitle}: você deixou ${job.origin} rumo a ${job.destination} para ${job.clientFactionShort}.`,
      "good"
    );
  } else {
    addLog(
      `Você partiu de ${job.origin} levando ${job.cargoAmount} unidades de ${job.cargoType.name} para ${job.destination}. (Distância: ${job.distance} UA, Risco base: ${adjustedRiskBase}%, Cliente: ${job.clientFactionShort}, Combustível: ${effectiveFuelCost})`
    );
  }

  if (job.isStory) {
    runStoryMissionOutcome(job);
  } else {
    applyTravelEvent(travelingJob);
  }

  generateJobs();
  checkMoraleEvents("trip");
}
