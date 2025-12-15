// src/systems/progression.ts
import { addLog } from "../core/services/log";
import { gameState } from "../core/state";
import { ShipId, getShipDefinition } from "../core/ships";

export type MilestoneReward = {
  unlockShips?: ShipId[];
  unlockUpgrades?: string[];
  logMessage?: string;
};

export type Milestone = {
  id: string;
  name: string;
  description: string;
  condition: (state: typeof gameState) => boolean;
  reward: MilestoneReward;
};

const MILESTONES: Milestone[] = [
  {
    id: "FIRST_CONTRACTS",
    name: "Capitão de Verdade",
    description: "Conclua 3 entregas bem-sucedidas para liberar cascos melhores.",
    condition: state => state.missionHistory.filter(h => h.status !== "failure").length >= 3,
    reward: {
      unlockShips: ["caelum-runner" as ShipId],
      logMessage: "A doca liberou o acesso ao Caelum Runner após suas primeiras entregas."
    }
  },
  {
    id: "BULK_LICENSE",
    name: "Licença de Carga Pesada",
    description: "Atinga 30.000 créditos em caixa para operar cargueiros volumosos.",
    condition: state => state.credits >= 30_000,
    reward: {
      unlockShips: ["orion-bulk" as ShipId],
      logMessage: "Os inspetores autorizaram sua compra de um Orion-Bulk."
    }
  },
  {
    id: "ELITE_TRANSPORTER",
    name: "Transportador de Elite",
    description: "Registre 10 entregas totais para receber contratos especiais de alta recompensa.",
    condition: state => state.missionHistory.filter(h => h.status !== "failure").length >= 10,
    reward: {
      unlockShips: ["draconis-dragon" as ShipId],
      unlockUpgrades: ["ELITE_CONTRACTS"],
      logMessage: "Liberados contratos de elite e o casco Dragão de Draconis nas docas."
    }
  },
  {
    id: "FIRST_100K",
    name: "Primeiros 100 mil",
    description: "Alcance 100.000 créditos acumulados para receber projetos avançados.",
    condition: state => state.credits >= 100_000,
    reward: {
      unlockUpgrades: ["ENGINE_MK2"],
      logMessage: "Projetos avançados de engenharia agora estão disponíveis."
    }
  }
];

function applyReward(milestone: Milestone) {
  const { reward } = milestone;
  const progression = gameState.progression;

  reward.unlockShips?.forEach(shipKey => {
    if (!progression.unlockedShips.includes(shipKey)) {
      progression.unlockedShips.push(shipKey);
      const shipDef = getShipDefinition(shipKey);
      if (shipDef) {
        addLog(`Novo casco desbloqueado: ${shipDef.name}.`, "good");
      }
    }
  });

  reward.unlockUpgrades?.forEach(upgrade => {
    if (!progression.unlockedUpgrades.includes(upgrade)) {
      progression.unlockedUpgrades.push(upgrade);
      addLog(`Blueprint desbloqueada: ${upgrade.replace(/_/g, " ")}.`, "good");
    }
  });

  if (reward.logMessage) {
    addLog(reward.logMessage, "good");
  }
}

export function evaluateMilestones() {
  MILESTONES.forEach(milestone => {
    if (gameState.progression.milestonesCompleted.includes(milestone.id)) return;

    if (milestone.condition(gameState)) {
      gameState.progression.milestonesCompleted.push(milestone.id);
      applyReward(milestone);
    }
  });
}

export function isShipUnlocked(shipKey: ShipId) {
  return gameState.progression.unlockedShips.includes(shipKey);
}

export function getShipUnlockHint(shipKey: ShipId): string | undefined {
  const milestone = MILESTONES.find(m => m.reward.unlockShips?.includes(shipKey));
  if (!milestone) return undefined;

  const completed = gameState.progression.milestonesCompleted.includes(milestone.id);
  return completed
    ? `Liberada ao completar o marco "${milestone.name}".`
    : `Complete o marco "${milestone.name}" para liberar.`;
}

export function getMilestones() {
  return MILESTONES;
}
