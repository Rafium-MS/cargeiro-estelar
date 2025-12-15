// src/systems/story.ts
import { CARGO_TYPES, randInt, clamp } from "../core/data";
import { getLocationData, distanceBetween } from "../core/map";
import { Job } from "../core/models";
import { addLog } from "../core/services/log";
import { gameState } from "../core/state";
import { registerMissionCompletion } from "./missionHistory";
import { applyJobEconomics, estimateMaintenanceCost } from "./economy";

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

function settleStoryEconomy(job: Job, payment: number) {
  const economics = applyJobEconomics(job, payment);
  const note =
    ` [Economia] Pagamento ${payment} cr · Combustível -${economics.fuelCost} cr · ` +
    `Taxa portuária -${economics.portFee} cr · Manutenção -${economics.maintenanceCost} cr · ` +
    `Lucro líquido ${economics.netProfit} cr.`;

  return { economics, note };
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

    const riskBase = 55;

    const job = {
      id: "story_auth1_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 10 + Math.round(distance * 2),
      riskBase,
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
      completed: false,
      maintenanceCost: estimateMaintenanceCost({ riskBase, distance })
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

    const riskBase = 45;

    const job = {
      id: "story_corp1_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 8 + Math.round(distance * 2),
      riskBase,
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
      completed: false,
      maintenanceCost: estimateMaintenanceCost({ riskBase, distance })
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

    const riskBase = 70;

    const job = {
      id: "story_syn1_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 12 + Math.round(distance * 2),
      riskBase,
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
      completed: false,
      maintenanceCost: estimateMaintenanceCost({ riskBase, distance })
    };

    gameState.jobs.unshift(job);
  }

  if (storyId === "authMission2") {
    const destination = "Anel Orbital de Vega";
    const originData = getLocationData(origin);
    const destData = getLocationData(destination);
    const distance = distanceBetween(origin, destination);
    const cargoType = CARGO_TYPES.find(c => c.key === "fragile")!;
    const cargoAmount = 12;
    const basePay = 1800;
    const pay = basePay + Math.round(distance * 45);

    const riskBase = 68;

    const job = {
      id: "story_auth2_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 12 + Math.round(distance * 2.5),
      riskBase,
      cargoType,
      distance,
      originZone: originData.zone,
      destinationZone: destData.zone,
      clientFactionKey: "authorities",
      clientFactionName: "Autoridades do Setor",
      clientFactionShort: "Autoridades",
      isStory: true,
      storyId: "authMission2",
      storyTitle: "Operação Guarda Solar",
      storySummary: "Entrega sigilosa de sensores para montar um cordão de vigilância anti-pirata. Expectativa de forte fiscalização.",
      completed: false,
      maintenanceCost: estimateMaintenanceCost({ riskBase, distance })
    };

    gameState.jobs.unshift(job);
  }

  if (storyId === "corpMission2") {
    const destination = "Terminal Mercante Draconis";
    const originData = getLocationData(origin);
    const destData = getLocationData(destination);
    const distance = distanceBetween(origin, destination);
    const cargoType = CARGO_TYPES.find(c => c.key === "legal")!;
    const cargoAmount = 16;
    const basePay = 1900;
    const pay = basePay + Math.round(distance * 55);

    const riskBase = 62;

    const job = {
      id: "story_corp2_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 11 + Math.round(distance * 2.2),
      riskBase,
      cargoType,
      distance,
      originZone: originData.zone,
      destinationZone: destData.zone,
      clientFactionKey: "corporations",
      clientFactionName: "Mega Corporações",
      clientFactionShort: "Corporações",
      isStory: true,
      storyId: "corpMission2",
      storyTitle: "Rede de Licitação Sombria",
      storySummary: "Rebocar licitações falsas para driblar concorrentes. Lucro alto, mas queixas de sabotagem podem atrair olhares.",
      completed: false,
      maintenanceCost: estimateMaintenanceCost({ riskBase, distance })
    };

    gameState.jobs.unshift(job);
  }

  if (storyId === "syndMission2") {
    const destination = "Porto Espacial Orion Prime";
    const originData = getLocationData(origin);
    const destData = getLocationData(destination);
    const distance = distanceBetween(origin, destination);
    const cargoType = CARGO_TYPES.find(c => c.key === "smuggle")!;
    const cargoAmount = 18;
    const basePay = 2100;
    const pay = basePay + Math.round(distance * 60);

    const riskBase = 74;

    const job = {
      id: "story_syn2_" + Date.now(),
      origin,
      destination,
      cargoAmount,
      basePay,
      pay,
      fuelCost: 14 + Math.round(distance * 3),
      riskBase,
      cargoType,
      distance,
      originZone: originData.zone,
      destinationZone: destData.zone,
      clientFactionKey: "syndicate",
      clientFactionName: "Sindicato do Submundo",
      clientFactionShort: "Sindicato",
      isStory: true,
      storyId: "syndMission2",
      storyTitle: "Transponder Gêmeo",
      storySummary: "Circular por portos do núcleo com um transponder clonado para coletar dívidas e favores. Baixa margem para erros.",
      completed: false,
      maintenanceCost: estimateMaintenanceCost({ riskBase, distance })
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

  if (gameState.storyFlags.authMission1Complete && !gameState.storyFlags.authMission2 && rep.authorities >= 45) {
    gameState.storyFlags.authMission2 = true;
    spawnStoryJob("authMission2");
    addLog(
      "Nova abertura das Autoridades: 'Operação Guarda Solar' requer veteranos que não hesitem em zonas de inspeção hostil.",
      "good"
    );
  }

  if (!gameState.storyFlags.corpMission1 && rep.corporations >= 20) {
    gameState.storyFlags.corpMission1 = true;
    spawnStoryJob("corpMission1");
    addLog("Uma megacorporação adicionou sua nave à lista de confiança. 'Contrato VIP Experimental' disponível como Missão Especial.", "good");
  }

  if (gameState.storyFlags.corpMission1Complete && !gameState.storyFlags.corpMission2 && rep.corporations >= 50) {
    gameState.storyFlags.corpMission2 = true;
    spawnStoryJob("corpMission2");
    addLog(
      "A diretoria confidenciou um novo esquema: 'Rede de Licitação Sombria' liberada como sequência para capitães discretos.",
      "warning"
    );
  }

  if (!gameState.storyFlags.syndMission1 && rep.syndicate >= 20) {
    gameState.storyFlags.syndMission1 = true;
    spawnStoryJob("syndMission1");
    addLog("Um contato do Sindicato sussurrou sobre o 'Golpe da Rota Fantasma'. Missão Especial liberada.", "good");
  }

  if (gameState.storyFlags.syndMission1Complete && !gameState.storyFlags.syndMission2 && rep.syndicate >= 55) {
    gameState.storyFlags.syndMission2 = true;
    spawnStoryJob("syndMission2");
    addLog(
      "O Sindicato exige mais: 'Transponder Gêmeo' promete fama no submundo, mas as retaliações podem ecoar por meses.",
      "warning"
    );
  }
}

import { adjustCrewMoraleRange, adjustCrewFatigueAll } from "./crew";

export function runStoryMissionOutcome(job: Job) {
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
    const { note } = settleStoryEconomy(job, job.pay + bonus);
    adjustReputation("authorities", +18);
    adjustReputation("syndicate", -10);
    gameState.storyFlags.authMission1Complete = true;

    addLog(
      "MISSÃO ESPECIAL – Operação Rede Limpa: você atuou como isca em uma operação conjunta. Piratas foram cercados por fragatas das Autoridades." + note,
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
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("corporations", +8);
      adjustReputation("authorities", +3);
      gameState.storyFlags.corpMission1Complete = true;

      addLog(
        "MISSÃO ESPECIAL – Contrato VIP Experimental: houve um microvazamento, mas sua tripulação reagiu rápido. Entrega aceita com ressalvas e bônus moderado." + note,
        "warning"
      );
      adjustCrewMoraleRange(+2, +6);
      adjustCrewFatigueAll(+3);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    } else {
      const bonus = 500;
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("corporations", +18);
      adjustReputation("authorities", +5);
      gameState.storyFlags.corpMission1Complete = true;

      addLog(
        "MISSÃO ESPECIAL – Contrato VIP Experimental: transferência impecável dos protótipos, com elogio nominal ao capitão em relatório interno." + note,
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
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("syndicate", +16);
      adjustReputation("authorities", -15);
      gameState.storyFlags.syndMission1Complete = true;

      addLog(
        "MISSÃO ESPECIAL – Golpe da Rota Fantasma: o golpe deu certo, mas parte do lucro 'evaporou' nas taxas internas do Sindicato." + note,
        "warning"
      );
      adjustCrewMoraleRange(+3, +8);
      adjustCrewFatigueAll(+6);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    } else {
      const bonus = 900;
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("syndicate", +22);
      adjustReputation("authorities", -20);
      adjustReputation("corporations", -5);
      gameState.storyFlags.syndMission1Complete = true;

      addLog(
        "MISSÃO ESPECIAL – Golpe da Rota Fantasma: a combinação de rotas falsas e transponder clonado entrou para o folclore do submundo." + note,
        "good"
      );
      adjustCrewMoraleRange(+8, +14);
      adjustCrewFatigueAll(+8);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    }
    return;
  }

  if (job.storyId === "authMission2") {
    const interception = randInt(1, 100);
    if (interception <= 35) {
      const bonus = 350;
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("authorities", +14);
      adjustReputation("syndicate", -8);

      addLog(
        "MISSÃO ESPECIAL – Operação Guarda Solar: escolta sofreu abordagens simultâneas. Você manteve o comboio unido, com sensores instalados mesmo sob fogo cruzado. Autoridades aprovam a firmeza, mas a retaliação pirata já é comentada." + note,
        "warning"
      );
      adjustCrewMoraleRange(+3, +7);
      adjustCrewFatigueAll(+7);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    } else {
      const bonus = 900;
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("authorities", +24);
      adjustReputation("syndicate", -14);

      addLog(
        "MISSÃO ESPECIAL – Operação Guarda Solar: rede de vigilância concluída sem perdas, bloqueando duas rotas clandestinas. Relatos indicam que piratas juraram vingança discreta contra a tripulação." + note,
        "good"
      );
      adjustCrewMoraleRange(+7, +12);
      adjustCrewFatigueAll(+6);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    }
    gameState.storyFlags.authMission2Complete = true;
    return;
  }

  if (job.storyId === "corpMission2") {
    const audit = randInt(1, 100);
    if (audit <= 30) {
      const bonus = 400;
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("corporations", +12);
      adjustReputation("authorities", -6);

      addLog(
        "MISSÃO ESPECIAL – Rede de Licitação Sombria: um auditor desconfiado rastreou parte do frete. Você desviou a atenção com dados falsos, garantindo lucro, mas rumores de manipulação podem voltar em reuniões futuras." + note,
        "warning"
      );
      adjustCrewMoraleRange(+2, +5);
      adjustCrewFatigueAll(+5);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    } else {
      const bonus = 950;
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("corporations", +22);
      adjustReputation("authorities", +4);

      addLog(
        "MISSÃO ESPECIAL – Rede de Licitação Sombria: as propostas isca derrubaram concorrentes, e você foi citado como peça-chave na manobra. Conselho corporativo sinaliza contratos preferenciais, mas rivais memorizaram seu rosto." + note,
        "good"
      );
      adjustCrewMoraleRange(+6, +10);
      adjustCrewFatigueAll(+5);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    }
    gameState.storyFlags.corpMission2Complete = true;
    return;
  }

  if (job.storyId === "syndMission2") {
    const shadow = randInt(1, 100);
    if (shadow <= 40) {
      const bonus = 500;
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("syndicate", +14);
      adjustReputation("authorities", -12);
      adjustReputation("corporations", -6);

      addLog(
        "MISSÃO ESPECIAL – Transponder Gêmeo: duas patrulhas desconfiaram do transponder clonado. Você usou rotas laterais, mas deixou rastros que podem ser cruzados depois. O Sindicato aprecia a ousadia, mesmo sabendo do risco latente." + note,
        "warning"
      );
      adjustCrewMoraleRange(+3, +8);
      adjustCrewFatigueAll(+9);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    } else {
      const bonus = 1100;
      const { note } = settleStoryEconomy(job, job.pay + bonus);
      adjustReputation("syndicate", +26);
      adjustReputation("authorities", -22);
      adjustReputation("corporations", -10);

      addLog(
        "MISSÃO ESPECIAL – Transponder Gêmeo: você sincronizou o transponder clonado com cobranças antigas e limpou dívidas do Sindicato. Boato nos portos diz que inspetores estão caçando a nave 'fantasma' que roubou taxas." + note,
        "good"
      );
      adjustCrewMoraleRange(+8, +14);
      adjustCrewFatigueAll(+10);
      registerMissionCompletion({ ...baseData, reward: job.pay + bonus });
    }
    gameState.storyFlags.syndMission2Complete = true;
    return;
  }

  const { note } = settleStoryEconomy(job, job.pay);
  addLog("Missão especial concluída. Consequências registradas e pagamento recebido." + note, "good");
  registerMissionCompletion(baseData);
}
