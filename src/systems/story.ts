// src/systems/story.ts
import { gameState, getLocationData, distanceBetween } from "../core/state";
import { CARGO_TYPES, randInt, clamp } from "../core/data";
import { addLog } from "../ui/log";
import { registerMissionCompletion } from "./missionHistory";

export function adjustReputation(factionKey: string, delta: number) {
  if (!(factionKey in gameState.reputation)) return;
  gameState.reputation[factionKey as keyof typeof gameState.reputation] = clamp(
    gameState.reputation[factionKey as keyof typeof gameState.reputation] + delta,
    -100,
    100
  );
}

export function factionPayMultiplier(factionKey: string): number {
  const rep = gameState.reputation[factionKey as keyof typeof gameState.reputation] || 0;
  let mult = 1;

  if (factionKey === "corporations") {
    mult += rep / 200;
  } else if (factionKey === "authorities") {
    mult += rep / 250;
  } else if (factionKey === "syndicate") {
    mult += rep / 150;
  }

  mult = clamp(mult, 0.5, 2.2);
  return mult;
}

export function spawnStoryJob(storyId: string) {
  const origin = gameState.location;

  if (storyId === "authMission1") {
    const destination = "Entreposto Asteroidal 7-G";
    const originData = getLocationData(origin);
    const destData = getLocationData(destination);
    const distance = distanceBetween(origin, destination);
    const cargoType = CARGO_TYPES.find(c => c.key === "legal")!;
    const cargoAmount = 10;
    const basePay = 1200;
    const pay = basePay + Math.round(distance * 35);

    const job = {
      id: "story_auth1_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 10 + Math.round(distance * 2),
      riskBase: 55,
      cargoType,
      distance,
      originZone: originData.zone,
      destinationZone: destData.zone,
      clientFactionKey: "authorities",
      clientFactionName: "Autoridades do Setor",
      clientFactionShort: "Autoridades",
      isStory: true,
      storyId: "authMission1",
      storyTitle: "Operação Rede Limpa",
      storySummary: "Comboio de isca para ajudar as Autoridades a desmontar uma rota de piratas.",
      completed: false
    };

    gameState.jobs.unshift(job);
  }

  if (storyId === "corpMission1") {
    const destination = "Porto Espacial Orion Prime";
    const originData = getLocationData(origin);
    const destData = getLocationData(destination);
    const distance = distanceBetween(origin, destination);
    const cargoType = CARGO_TYPES.find(c => c.key === "fragile")!;
    const cargoAmount = 8;
    const basePay = 1400;
    const pay = basePay + Math.round(distance * 40);

    const job = {
      id: "story_corp1_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 8 + Math.round(distance * 2),
      riskBase: 45,
      cargoType,
      distance,
      originZone: originData.zone,
      destinationZone: destData.zone,
      clientFactionKey: "corporations",
      clientFactionName: "Mega Corporações",
      clientFactionShort: "Corporações",
      isStory: true,
      storyId: "corpMission1",
      storyTitle: "Contrato VIP Experimental",
      storySummary: "Transporte de protótipos experimentais para um laboratório de alto nível.",
      completed: false
    };

    gameState.jobs.unshift(job);
  }

  if (storyId === "syndMission1") {
    const destination = "Colônia Fronteira Kaelum";
    const originData = getLocationData(origin);
    const destData = getLocationData(destination);
    const distance = distanceBetween(origin, destination);
    const cargoType = CARGO_TYPES.find(c => c.key === "smuggle")!;
    const cargoAmount = 14;
    const basePay = 1600;
    const pay = basePay + Math.round(distance * 50);

    const job = {
      id: "story_syn1_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 12 + Math.round(distance * 2),
      riskBase: 70,
      cargoType,
      distance,
      originZone: originData.zone,
      destinationZone: destData.zone,
      clientFactionKey: "syndicate",
      clientFactionName: "Sindicato do Submundo",
      clientFactionShort: "Sindicato",
      isStory: true,
      storyId: "syndMission1",
      storyTitle: "Golpe da Rota Fantasma",
      storySummary: "Uma única viagem carregada de contrabando para consolidar sua fama no submundo.",
      completed: false
    };

    gameState.jobs.unshift(job);
  }
}

export function checkStoryMissionTriggers() {
  const rep = gameState.reputation;

  if (!gameState.storyFlags.authMission1 && rep.authorities >= 20) {
    gameState.storyFlags.authMission1 = true;
    spawnStoryJob("authMission1");
    addLog("As Autoridades do Setor enviaram um pacote cifrado: 'Operação Rede Limpa' disponível como Missão Especial.", "good");
  }

  if (!gameState.storyFlags.corpMission1 && rep.corporations >= 20) {
    gameState.storyFlags.corpMission1 = true;
    spawnStoryJob("corpMission1");
    addLog("Uma megacorporação adicionou sua nave à lista de confiança. 'Contrato VIP Experimental' disponível como Missão Especial.", "good");
  }

  if (!gameState.storyFlags.syndMission1 && rep.syndicate >= 20) {
    gameState.storyFlags.syndMission1 = true;
    spawnStoryJob("syndMission1");
    addLog("Um contato do Sindicato sussurrou sobre o 'Golpe da Rota Fantasma'. Missão Especial liberada.", "good");
  }
}

import { adjustCrewMoraleRange, adjustCrewFatigueAll } from "./crew";

export function runStoryMissionOutcome(job: any) {
  job.completed = true;

  const baseData = {
    id: job.id,
    title: job.storyTitle ?? "Missão especial",
    factionKey: job.clientFactionKey,
    kind: "especial" as const,
    reward: job.pay,
    day: gameState.day
  };

  if (job.storyId === "authMission1") {
    const bonus = 500;
    gameState.credits += job.pay + bonus;
    adjustReputation("authorities", +18);
    adjustReputation("syndicate", -10);

    addLog(
      "MISSÃO ESPECIAL – Operação Rede Limpa: você atuou como isca em uma operação conjunta. Piratas foram cercados por fragatas das Autoridades.",
      "good"
    );
    adjustCrewMoraleRange(+5, +10);
    adjustCrewFatigueAll(+4);
    registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    return;
  }

  if (job.storyId === "corpMission1") {
    const complicationRoll = randInt(1, 100);
    if (complicationRoll <= 20) {
      const bonus = 200;
      gameState.credits += job.pay + bonus;
      adjustReputation("corporations", +8);
      adjustReputation("authorities", +3);

      addLog(
        "MISSÃO ESPECIAL – Contrato VIP Experimental: houve um microvazamento, mas sua tripulação reagiu rápido. Entrega aceita com ressalvas e bônus moderado.",
        "warning"
      );
      adjustCrewMoraleRange(+2, +6);
      adjustCrewFatigueAll(+3);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    } else {
      const bonus = 500;
      gameState.credits += job.pay + bonus;
      adjustReputation("corporations", +18);
      adjustReputation("authorities", +5);

      addLog(
        "MISSÃO ESPECIAL – Contrato VIP Experimental: transferência impecável dos protótipos, com elogio nominal ao capitão em relatório interno.",
        "good"
      );
      adjustCrewMoraleRange(+6, +12);
      adjustCrewFatigueAll(+3);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    }
    return;
  }

  if (job.storyId === "syndMission1") {
    const twist = randInt(1, 100);
    if (twist <= 25) {
      const bonus = 300;
      gameState.credits += job.pay + bonus;
      adjustReputation("syndicate", +16);
      adjustReputation("authorities", -15);

      addLog(
        "MISSÃO ESPECIAL – Golpe da Rota Fantasma: o golpe deu certo, mas parte do lucro 'evaporou' nas taxas internas do Sindicato.",
        "warning"
      );
      adjustCrewMoraleRange(+3, +8);
      adjustCrewFatigueAll(+6);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    } else {
      const bonus = 900;
      gameState.credits += job.pay + bonus;
      adjustReputation("syndicate", +22);
      adjustReputation("authorities", -20);
      adjustReputation("corporations", -5);

      addLog(
        "MISSÃO ESPECIAL – Golpe da Rota Fantasma: a combinação de rotas falsas e transponder clonado entrou para o folclore do submundo.",
        "good"
      );
      adjustCrewMoraleRange(+8, +14);
      adjustCrewFatigueAll(+8);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    }
    return;
  }

  gameState.credits += job.pay;
  addLog("Missão especial concluída. Pagamento recebido.", "good");
  registerMissionCompletion(baseData);
}
