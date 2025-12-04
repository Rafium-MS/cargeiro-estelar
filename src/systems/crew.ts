// src/systems/crew.ts
import { gameState } from "../core/state";
import { ROLES, NAME_POOL, randInt, chooseRandom, clamp } from "../core/data";
import { addLog } from "../ui/log";

type CrewEffect = {
  key: string;
  name: string;
  type: "buff" | "debuff";
  description: string;
  riskMod?: number; // altera chance de evento ruim
  fuelPercent?: number; // modifica custo de combustível
  hullDamagePercent?: number; // modifica dano ao casco
  fatigueFlat?: number; // modifica fadiga recebida em viagens
  bonusRoll?: number; // aumenta chance de bônus ao entregar
  skillBonus?: Partial<Record<"pilot" | "engineer" | "security" | "logistics", number>>;
};

const CREW_EFFECT_POOL: CrewEffect[] = [
  {
    key: "lucky_nav",
    name: "Navegador Pé-Quente",
    type: "buff",
    description: "-8 de risco em viagens e pequenas dicas de rotas seguras.",
    riskMod: -8,
    bonusRoll: 5
  },
  {
    key: "fuel_saver",
    name: "Economia de Combustível",
    type: "buff",
    description: "-15% de combustível gasto e mais fôlego para a tripulação.",
    fuelPercent: -15,
    fatigueFlat: -2
  },
  {
    key: "hull_veteran",
    name: "Veterano de Casco",
    type: "buff",
    description: "-20% de dano recebido no casco e +1 em Engenharia efetiva.",
    hullDamagePercent: -20,
    skillBonus: { engineer: 1 }
  },
  {
    key: "logistics_pro",
    name: "Olho para Gorjetas",
    type: "buff",
    description: "+8 no rolagem de bônus de entrega e +1 em Logística.",
    bonusRoll: 8,
    skillBonus: { logistics: 1 }
  },
  {
    key: "reckless",
    name: "Piloto Imprudente",
    type: "debuff",
    description: "+12% de combustível gasto e +5 de risco em viagens.",
    fuelPercent: 12,
    riskMod: 5
  },
  {
    key: "tired",
    name: "Sono Irregular",
    type: "debuff",
    description: "+4 de fadiga ao viajar; tem dificuldade para longos saltos.",
    fatigueFlat: 4
  },
  {
    key: "hull_curse",
    name: "Azar com Casco",
    type: "debuff",
    description: "+15% de dano tomado em ataques ou eventos.",
    hullDamagePercent: 15
  },
  {
    key: "greenhorn",
    name: "Inexperiente",
    type: "debuff",
    description: "-1 no atributo principal e +2 de risco em viagens.",
    riskMod: 2,
    skillBonus: { pilot: -1, engineer: -1, security: -1, logistics: -1 }
  }
];

export function getCrewEffectModifiers() {
  return gameState.crew.reduce(
    (acc: any, member: any) => {
      (member.effects || []).forEach((effect: CrewEffect) => {
        acc.riskMod += effect.riskMod ?? 0;
        acc.fuelPercent += effect.fuelPercent ?? 0;
        acc.hullDamagePercent += effect.hullDamagePercent ?? 0;
        acc.fatigueFlat += effect.fatigueFlat ?? 0;
        acc.bonusRoll += effect.bonusRoll ?? 0;
      });
      return acc;
    },
    { riskMod: 0, fuelPercent: 0, hullDamagePercent: 0, fatigueFlat: 0, bonusRoll: 0 }
  );
}

export function getCrewEffectLabels() {
  const labels: string[] = [];
  gameState.crew.forEach((member: any) => {
    (member.effects || []).forEach((effect: CrewEffect) => {
      labels.push(`${effect.name} (${effect.type === "buff" ? "bônus" : "penalidade"})`);
    });
  });
  return labels;
}

export function generateCrewCandidate() {
  const name = chooseRandom(NAME_POOL);
  const roleInfo = chooseRandom(ROLES);
  const skill = randInt(1, 5);
  const baseSalary = 80 + skill * randInt(20, 45);
  const effect = chooseRandom(CREW_EFFECT_POOL);

  return {
    id: "crew_" + Date.now() + "_" + Math.random().toString(16).slice(2),
    name,
    role: roleInfo.role,
    key: roleInfo.key,
    skill,
    salaryPerDay: baseSalary,
    morale: randInt(60, 90),
    fatigue: randInt(0, 20),
    effects: [effect]
  };
}

export function generateCrewCandidates() {
  const candidates = [];
  for (let i = 0; i < 3; i++) {
    candidates.push(generateCrewCandidate());
  }
  gameState.crewCandidates = candidates;
  addLog("Novos candidatos aguardando na doca de recrutamento.");
}

export function rest() {
  const crewStats = getCrewStats();

  const dockingFee = 40;
  const maintenanceFee = Math.round(gameState.credits * 0.04);
  const salaryCost = crewStats.salaryPerDay;
  const totalCost = dockingFee + maintenanceFee + salaryCost;

  gameState.day += 1;
  gameState.credits -= totalCost;

  let hullRepaired = 0;
  if (gameState.ship.hull < gameState.ship.maxHull) {
    hullRepaired = Math.min(8, gameState.ship.maxHull - gameState.ship.hull);
    gameState.ship.hull += hullRepaired;
  }

  let fuelRefilled = 0;
  if (gameState.ship.fuel < gameState.ship.maxFuel) {
    fuelRefilled = Math.min(12, gameState.ship.maxFuel - gameState.ship.fuel);
    gameState.ship.fuel += fuelRefilled;
  }

  if (gameState.crew.length > 0) {
    gameState.crew.forEach((member: any) => {
      const recovered = randInt(12, 22);
      member.fatigue = clamp(member.fatigue - recovered, 0, 100);
      member.morale = clamp(member.morale + 3, 0, 100);
    });
  }

  const costParts = [`docagem ${dockingFee} cr`, `manutenção ${maintenanceFee} cr`];
  if (salaryCost > 0) costParts.push(`salários ${salaryCost} cr`);

  const recoveryParts: string[] = [];
  if (hullRepaired > 0) recoveryParts.push(`casco +${hullRepaired}`);
  if (fuelRefilled > 0) recoveryParts.push(`combustível +${fuelRefilled}`);

  const recoveryText = recoveryParts.length ? ` Recuperações: ${recoveryParts.join("; ")}.` : "";
  const crewText = gameState.crew.length > 0 ? " Fadiga da tripulação reduzida." : " Sem tripulação a bordo.";

  addLog(
    `Você descansou na estação por 1 dia (${costParts.join(" + ")}, total ${totalCost} cr).${recoveryText}${crewText}`,
    gameState.credits < 0 ? "warning" : "good"
  );

  checkMoraleEvents("rest");
}

export function hireCrew(id: string) {
  const candidate = gameState.crewCandidates.find((c: any) => c.id === id);
  if (!candidate) return;

  if (gameState.crew.length >= gameState.crewCapacity) {
    addLog("Você não tem alojamentos suficientes para mais tripulantes. Expanda a nave no hangar.", "warning");
    return;
  }

  if (gameState.credits < candidate.salaryPerDay * 2) {
    addLog("Créditos insuficientes para contratar esse tripulante com segurança (recomendado ter ao menos 2 dias de salário).", "warning");
    return;
  }

  gameState.crew.push(candidate);
  gameState.crewCandidates = gameState.crewCandidates.filter((c: any) => c.id !== id);
  addLog(`Você contratou ${candidate.name} como ${candidate.role}.`, "good");
}

export function fireCrew(id: string) {
  const member = gameState.crew.find((m: any) => m.id === id);
  if (!member) return;

  gameState.crew = gameState.crew.filter((m: any) => m.id !== id);
  addLog(`Você demitiu ${member.name} (${member.role}). O clima a bordo mudou.`, "warning");

  if (gameState.crew.length > 0) {
    gameState.crew.forEach((m: any) => {
      m.morale = clamp(m.morale - randInt(2, 6), 0, 100);
    });
  }
}

export function adjustCrewMoraleAll(delta: number) {
  if (gameState.crew.length === 0) return;
  gameState.crew.forEach((member: any) => {
    member.morale = clamp(member.morale + delta, 0, 100);
  });
}

export function adjustCrewMoraleRange(minDelta: number, maxDelta: number) {
  if (gameState.crew.length === 0) return;
  gameState.crew.forEach((member: any) => {
    const delta = randInt(minDelta, maxDelta);
    member.morale = clamp(member.morale + delta, 0, 100);
  });
}

export function adjustCrewFatigueAll(delta: number) {
  if (gameState.crew.length === 0) return;
  gameState.crew.forEach((member: any) => {
    member.fatigue = clamp(member.fatigue + delta, 0, 100);
  });
}

export function getCrewStats() {
  const stats = {
    pilot: 0,
    engineer: 0,
    security: 0,
    logistics: 0,
    salaryPerDay: 0,
    avgMorale: 0,
    avgFatigue: 0
  };

  if (gameState.crew.length === 0) return stats;

  let totalMorale = 0;
  let totalFatigue = 0;

  gameState.crew.forEach((member: any) => {
    stats.salaryPerDay += member.salaryPerDay;
    totalMorale += member.morale;
    totalFatigue += member.fatigue;

    let effectiveSkill = member.skill;

    if (member.morale < 40) effectiveSkill -= 1;
    if (member.morale < 20) effectiveSkill -= 1;
    if (member.fatigue > 60) effectiveSkill -= 1;
    if (member.fatigue > 80) effectiveSkill -= 1;

    (member.effects || []).forEach((effect: CrewEffect) => {
      const bonus = effect.skillBonus?.[member.key];
      if (typeof bonus === "number") {
        effectiveSkill += bonus;
      }
    });

    if (effectiveSkill < 0) effectiveSkill = 0;

    stats[member.key] += effectiveSkill;
  });

  stats.avgMorale = Math.round(totalMorale / gameState.crew.length);
  stats.avgFatigue = Math.round(totalFatigue / gameState.crew.length);

  return stats;
}

export function checkMoraleEvents(context: "trip" | "rest") {
  const crewStats = getCrewStats();
  if (gameState.crew.length === 0) return;

  const avgMorale = crewStats.avgMorale;
  const avgFatigue = crewStats.avgFatigue;

  if (avgMorale <= 25) {
    const chance = context === "trip" ? 35 : 20;
    const roll = randInt(1, 100);
    if (roll <= chance) {
      if (gameState.credits > crewStats.salaryPerDay) {
        const bonusPay = crewStats.salaryPerDay;
        gameState.credits -= bonusPay;
        addLog(
          "A tripulação ameaçou um motim leve. Você precisou pagar um bônus emergencial equivalente a um dia de salários para acalmar os ânimos.",
          "danger"
        );
        adjustCrewMoraleAll(+10);
      } else {
        const deserter = chooseRandom(gameState.crew);
        gameState.crew = gameState.crew.filter((m: any) => m.id !== deserter.id);
        addLog(
          `${deserter.name} abandonou o cargueiro por falta de confiança no comando. O restante da tripulação está abalado.`,
          "danger"
        );
        adjustCrewMoraleAll(-5);
      }
      return;
    }
  }

  if (avgMorale >= 70) {
    const roll = randInt(1, 100);
    const chance = context === "trip" ? 25 : 15;
    if (roll <= chance) {
      const member = chooseRandom(gameState.crew);
      const raisePercent = randInt(10, 30);
      const oldSalary = member.salaryPerDay;
      const newSalary = Math.round(member.salaryPerDay * (1 + raisePercent / 100));
      member.salaryPerDay = newSalary;

      addLog(
        `${member.name} (${member.role}) pediu aumento após bons resultados. Você concedeu um reajuste de ${raisePercent}% (de ${oldSalary} para ${newSalary} cr/dia).`,
        "warning"
      );

      member.morale = clamp(member.morale + 12, 0, 100);
      gameState.crew
        .filter((m: any) => m.id !== member.id)
        .forEach((m: any) => {
          m.morale = clamp(m.morale + randInt(-2, +3), 0, 100);
        });
    }
  }

  if (avgFatigue >= 75) {
    const roll = randInt(1, 100);
    const chance = 30;
    if (roll <= chance) {
      addLog(
        "A tripulação está exausta e deixou claro que precisa de descanso em breve. Se ignorar, os próximos eventos podem ser piores.",
        "warning"
      );
      adjustCrewMoraleAll(-3);
    }
  }
}
