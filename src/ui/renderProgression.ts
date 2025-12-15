import { gameState } from "../core/state";
import { getShipDefinition } from "../core/ships";
import { getMilestones } from "../systems/progression";

export function renderProgression() {
  const milestoneContainer = document.getElementById("progression-list");
  if (milestoneContainer) {
    milestoneContainer.innerHTML = "";
    const milestones = getMilestones();

    milestones.forEach(milestone => {
      const completed = gameState.progression.milestonesCompleted.includes(milestone.id);
      const row = document.createElement("div");
      row.className = "map-row";
      row.innerHTML = `
        <span>
          <strong>${milestone.name}</strong><br>
          <span class="small">${milestone.description}</span>
        </span>
        <span>${completed ? "Concluído" : "Em progresso"}</span>
      `;
      milestoneContainer.appendChild(row);
    });
  }

  const unlocksContainer = document.getElementById("progression-unlocks");
  if (unlocksContainer) {
    unlocksContainer.innerHTML = "";

    const unlockedShips = gameState.progression.unlockedShips
      .map(shipKey => getShipDefinition(shipKey))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (unlockedShips.length === 0 && gameState.progression.unlockedUpgrades.length === 0) {
      const row = document.createElement("div");
      row.className = "small";
      row.textContent = "Nenhum desbloqueio ativo ainda. Complete marcos para liberar conteúdo.";
      unlocksContainer.appendChild(row);
      return;
    }

    if (unlockedShips.length > 0) {
      const row = document.createElement("div");
      row.className = "map-row";
      row.innerHTML = `
        <span><strong>Naves liberadas</strong></span>
        <span>${unlockedShips.map(s => s.name).join(" · ")}</span>
      `;
      unlocksContainer.appendChild(row);
    }

    if (gameState.progression.unlockedUpgrades.length > 0) {
      const row = document.createElement("div");
      row.className = "map-row";
      row.innerHTML = `
        <span><strong>Upgrades especiais</strong></span>
        <span>${gameState.progression.unlockedUpgrades.map(u => u.replace(/_/g, " ")).join(" · ")}</span>
      `;
      unlocksContainer.appendChild(row);
    }
  }
}
