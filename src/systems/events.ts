// src/systems/events.ts
import { randInt, chooseRandom } from "../core/data";
import { CrewMember, Job } from "../core/models";
import { gameState } from "../core/state";
import { addLog } from "../ui/log";
import {
  getCrewStats,
  adjustCrewMoraleRange,
  adjustCrewFatigueAll,
  getCrewEffectModifiers
} from "./crew";
import { adjustReputation, checkStoryMissionTriggers } from "./story";
import { registerMissionCompletion } from "./missionHistory";

export function handleSuccessReputation(job: Job) {
  const f = job.clientFactionKey;
  if (f === "authorities") {
    adjustReputation("authorities", +4);
  } else if (f === "corporations") {
    adjustReputation("corporations", +4);
  } else if (f === "syndicate") {
    if (job.cargoType.key === "smuggle") {
      adjustReputation("syndicate", +8);
      adjustReputation("authorities", -5);
    } else {
      adjustReputation("syndicate", +3);
    }
  }
  checkStoryMissionTriggers();
}

export function applyTravelEvent(job: Job) {
  const crewStats = getCrewStats();
  const effects = getCrewEffectModifiers();
  const rep = gameState.reputation;

  const missionTitle = job.title ?? `${job.cargoType.name} → ${job.destination}`;
  const baseMissionData = {
    id: job.id,
    title: missionTitle,
    factionKey: job.clientFactionKey,
    kind: "normal" as const,
    day: gameState.day
  };

  const registerOutcome = (
    reward: number,
    status: "success" | "partial" | "failure" = "success"
  ) => {
    registerMissionCompletion({ ...baseMissionData, reward, status });
  };

  let risk = job.riskBase;
  risk -= rep.authorities * 0.1;
  risk -= rep.syndicate * 0.05;
  if (job.cargoType.key === "smuggle" && rep.authorities < 0) {
    risk += Math.abs(rep.authorities) * 0.3;
  }
  if (job.clientFactionKey === "syndicate" && rep.syndicate < -20) {
    risk += 10;
  }
  if (risk < 1) risk = 1;
  if (risk > 100) risk = 100;

  const roll = randInt(1, 100);
  const cargoKey = job.cargoType.key;

  const eventType = randInt(1, 3); // 1 pirata, 2 fiscalização, 3 rota/clima

  if (roll <= Math.min(10 + risk * 0.4, 85)) {
    // Evento ruim
    if (eventType === 1) {
      let damage = randInt(5, 20);
      damage -= crewStats.engineer * 2;
      damage = Math.round(damage * (1 + (effects.hullDamagePercent ?? 0) / 100));
      if (damage < 0) damage = 0;

      if (damage === 0) {
        addLog("Ataque de piratas, mas seu engenheiro e segurança contiveram o dano. Casco intacto!", "good");
        adjustCrewMoraleRange(+1, +3);
        registerOutcome(0, "failure");
      } else {
        gameState.ship.hull = Math.max(0, gameState.ship.hull - damage);
        let extraNote = "";
        if (cargoKey === "fragile") {
          extraNote = " Parte da carga frágil foi danificada no processo.";
          adjustReputation("corporations", -3);
        }
        addLog(`Ataque de piratas! O casco sofreu ${damage}% de dano.${extraNote}`, "danger");
        adjustCrewMoraleRange(-6, -3);
        adjustCrewFatigueAll(+4);
        registerOutcome(0, "failure");
      }
      return;
    }

    if (eventType === 2) {
      if (cargoKey === "smuggle") {
        let lossPercent = randInt(40, 80);
        lossPercent -= crewStats.security * 2;
        lossPercent = Math.max(25, lossPercent);

        const loss = Math.floor(job.pay * lossPercent / 100);
        const received = Math.max(0, job.pay - loss);
        gameState.credits += received;

        addLog(
          `Fiscalização pesada em ${job.destination}! Parte do contrabando foi confiscado. Você perdeu ${loss} créditos em mercadoria e subornos.`,
          "danger"
        );

        adjustCrewMoraleRange(-8, -4);
        adjustCrewFatigueAll(+3);

        adjustReputation("authorities", +12);
        adjustReputation("syndicate", -8);

        if (randInt(1, 100) <= 20 && gameState.crew.length > 0) {
          let candidate = gameState.crew.find((m: CrewMember) => m.key === "security") || chooseRandom(gameState.crew);
          gameState.crew = gameState.crew.filter((m: CrewMember) => m.id !== candidate.id);
          addLog(
            `${candidate.name} foi detido pelas autoridades durante a investigação do contrabando e teve que deixar a nave.`,
            "danger"
          );
          adjustCrewMoraleRange(-5, -3);
        }

        registerOutcome(received, received > 0 ? "partial" : "failure");
        return;
      } else if (cargoKey === "fragile") {
        let lossPercent = randInt(15, 45);
        lossPercent -= Math.floor(crewStats.logistics / 2);
        if (lossPercent < 10) lossPercent = 10;

        const loss = Math.floor(job.pay * lossPercent / 100);
        const received = job.pay - loss;
        gameState.credits += received;
        addLog(
          `Inspeção em ${job.destination} identificou danos na carga frágil. Você teve que reembolsar ${loss} créditos ao cliente.`,
          "warning"
        );
        adjustCrewMoraleRange(-3, -1);
        adjustCrewFatigueAll(+2);
        adjustReputation("corporations", -4);
        registerOutcome(received, received > 0 ? "partial" : "failure");
        return;
      } else {
        let lossPercent = randInt(10, 40);
        lossPercent -= crewStats.security;
        lossPercent -= Math.floor(crewStats.logistics / 2);
        if (lossPercent < 5) lossPercent = 5;

        const loss = Math.floor(job.pay * lossPercent / 100);
        const received = job.pay - loss;
        gameState.credits += received;
        addLog(
          `Fiscalização surpresa em ${job.destination}. Você teve que pagar ${loss} créditos em taxas e multas.`,
          "warning"
        );
        adjustCrewMoraleRange(-4, -1);
        adjustCrewFatigueAll(+2);
        adjustReputation("authorities", +2);
        registerOutcome(received, received > 0 ? "partial" : "failure");
        return;
      }
    }

    // rota/clima
        let fuelLoss = randInt(5, 18);
        fuelLoss -= crewStats.pilot * 2;
        fuelLoss = Math.round(fuelLoss * (1 + (effects.fuelPercent ?? 0) / 100));
        if (fuelLoss < 0) fuelLoss = 0;
    if (fuelLoss === 0) {
      addLog("Desvio de rota necessário, mas seu piloto encontrou a rota mais eficiente. Sem perda extra de combustível.", "good");
      adjustCrewMoraleRange(+1, +3);
    } else {
      gameState.ship.fuel = Math.max(0, gameState.ship.fuel - fuelLoss);
      addLog(`Desvio de rota por tempestade solar. Perdeu mais ${fuelLoss} de combustível.`, "warning");
      adjustCrewMoraleRange(-2, 0);
      adjustCrewFatigueAll(+2);
    }
    registerOutcome(0, "failure");
    return;
  }

  // Sem evento negativo, talvez bônus
  let bonusRoll = randInt(1, 100) + getCrewStats().logistics * 2 + (effects.bonusRoll ?? 0);

  if (cargoKey === "smuggle") {
    const bonusChance = bonusRoll + 10;
    if (bonusChance >= 90) {
      const bonus = randInt(150, 400);
      gameState.credits += job.pay + bonus;
      addLog(
        `Você passou com o contrabando sem ser detectado em ${job.destination}! O comprador pagou um bônus extra de ${bonus} créditos.`,
        "good"
      );
      adjustCrewMoraleRange(+6, +12);
      adjustCrewFatigueAll(+2);
      adjustReputation("syndicate", +10);
      adjustReputation("authorities", -5);
      registerOutcome(job.pay + bonus);
      return;
    }
  }

  if (bonusRoll >= 95) {
    const baseBonus = randInt(100, 300);
    const extraByLogistics = getCrewStats().logistics * randInt(10, 25);
    const bonus = baseBonus + extraByLogistics;
    gameState.credits += job.pay + bonus;
    addLog(
      `Cliente (${job.clientFactionShort}) em ${job.destination} adorou o serviço (${job.cargoType.name}) e deu uma gorjeta de ${bonus} créditos!`,
      "good"
    );
    adjustCrewMoraleRange(+5, +10);
    adjustCrewFatigueAll(+1);
    handleSuccessReputation(job);
    registerOutcome(job.pay + bonus);
  } else {
    gameState.credits += job.pay;
    addLog(
      `Entrega em ${job.destination} concluída. Você recebeu ${job.pay} créditos (${job.cargoType.name}) para ${job.clientFactionShort}.`,
      "good"
    );
    adjustCrewMoraleRange(+1, +3);
    adjustCrewFatigueAll(+2);
    handleSuccessReputation(job);
    registerOutcome(job.pay);
  }
}

export function restAtStation() {
  const crewStats = getCrewStats();
  const crewCount = gameState.crew.length;
  const baseCost = 40;
  const perCrewCost = 20;
  const totalCost = crewCount > 0 ? baseCost + crewCount * perCrewCost : baseCost;

  gameState.day += 1;
  gameState.credits -= totalCost;

  if (crewCount > 0) {
    gameState.crew.forEach((member: CrewMember) => {
      member.fatigue = Math.max(0, member.fatigue - 30);
      member.morale = Math.min(100, member.morale + 8);
    });
    addLog(
      `Você deu um dia de descanso para a tripulação em ${gameState.location}. Custou ${totalCost} créditos em hospedagem e lazer.`,
      "good"
    );
  } else {
    addLog(
      `Você passou um dia parado em ${gameState.location} revisando rotas e planilhas. Custos gerais: ${totalCost} créditos.`,
      "warning"
    );
  }
}
