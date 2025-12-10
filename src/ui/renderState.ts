import { MAP_LOCATIONS, FACTIONS, repStatus } from "../core/data";
import { MissionHistoryEntry } from "../core/models";
import { gameState } from "../core/state";
import { getCrewEffectLabels, getCrewStats } from "../systems/crew";
import { calculateRefuelCost, fuelMissing } from "../systems/fuel";
import { formatTag } from "./formatters";
import { renderUpgrades } from "./renderUpgrades";

export function renderState() {
  (document.getElementById("ship-name") as HTMLElement).textContent = gameState.ship.name;
  (document.getElementById("day") as HTMLElement).textContent = String(gameState.day);
  (document.getElementById("credits") as HTMLElement).textContent = `${gameState.credits} cr`;
  const shipTier = document.getElementById("ship-tier");
  if (shipTier) shipTier.textContent = `Tier ${gameState.ship.tier}`;
  const shipDesc = document.getElementById("ship-desc");
  if (shipDesc) shipDesc.textContent = gameState.ship.description;
  const shipTraits = document.getElementById("ship-traits");
  if (shipTraits) shipTraits.textContent = gameState.ship.traits.join(" · ");
  const cargoLabel = gameState.ship.smugglerHold
    ? `${gameState.ship.cargoCapacity} unidades + ${gameState.ship.smugglerHold} ocultas`
    : `${gameState.ship.cargoCapacity} unidades máx.`;
  (document.getElementById("hull") as HTMLElement).textContent =
    `${gameState.ship.hull}% / ${gameState.ship.maxHull}%`;
  (document.getElementById("fuel") as HTMLElement).textContent =
    `${gameState.ship.fuel} / ${gameState.ship.maxFuel}`;
  (document.getElementById("cargo") as HTMLElement).textContent = cargoLabel;
  (document.getElementById("location") as HTMLElement).textContent = gameState.location;

  const sidebarDay = document.getElementById("sidebar-day");
  if (sidebarDay) sidebarDay.textContent = `Dia ${gameState.day}`;

  const sidebarCredits = document.getElementById("sidebar-credits");
  if (sidebarCredits) sidebarCredits.textContent = `${gameState.credits} cr`;

  const sidebarFuel = document.getElementById("sidebar-fuel");
  if (sidebarFuel) sidebarFuel.textContent = `${gameState.ship.fuel}/${gameState.ship.maxFuel}`;

  const sidebarLocation = document.getElementById("sidebar-location");
  if (sidebarLocation) sidebarLocation.textContent = gameState.location;

  const refuelBtn = document.getElementById("btn-refuel") as HTMLButtonElement | null;
  if (refuelBtn) {
    const missingFuel = fuelMissing();
    const refuelCost = calculateRefuelCost();
    refuelBtn.textContent = missingFuel === 0
      ? "Combustível cheio"
      : `Abastecer (${missingFuel} por ${refuelCost} cr)`;
    refuelBtn.disabled = missingFuel === 0;
  }

  const crewStats = getCrewStats();
  (document.getElementById("crew-capacity") as HTMLElement).textContent =
    `${gameState.crew.length} / ${gameState.crewCapacity} membros`;
  (document.getElementById("crew-salary") as HTMLElement).textContent =
    `${crewStats.salaryPerDay} cr / dia`;

  if (gameState.crew.length === 0) {
    (document.getElementById("crew-mood") as HTMLElement).textContent =
      "Nenhuma tripulação a bordo.";
  } else {
    (document.getElementById("crew-mood") as HTMLElement).textContent =
      `Moral: ${crewStats.avgMorale} · Fadiga: ${crewStats.avgFatigue}`;
  }

  const bonusDesc: string[] = [];
  if (crewStats.pilot > 0) bonusDesc.push(`Piloto efetivo ${crewStats.pilot} (menos risco e desperdício)`);
  if (crewStats.engineer > 0) bonusDesc.push(`Engenharia efetiva ${crewStats.engineer} (menos dano no casco)`);
  if (crewStats.security > 0) bonusDesc.push(`Segurança efetiva ${crewStats.security} (menos multas/ataques)`);
  if (crewStats.logistics > 0) bonusDesc.push(`Logística efetiva ${crewStats.logistics} (mais chance de bônus)`);

  (document.getElementById("crew-bonus") as HTMLElement).textContent =
    bonusDesc.length ? bonusDesc.join(" · ") : "Nenhum bônus ativo. Contrate alguém!";

  const crewEffects = getCrewEffectLabels();
  const effectsTarget = document.getElementById("crew-effects") as HTMLElement | null;
  if (effectsTarget) {
    effectsTarget.textContent = crewEffects.length
      ? crewEffects.join(" · ")
      : "Nenhuma condição especial ativa.";
  }

  renderUpgrades();
  renderMap();
  renderReputation();
}

export function renderMap() {
  const container = document.getElementById("map-list")!;
  container.innerHTML = "";
  MAP_LOCATIONS.forEach(loc => {
    const row = document.createElement("div");
    row.className = "map-row";
    row.innerHTML = `
      <span><strong>${loc.name}</strong></span>
      <span>Pos: (${loc.x}, ${loc.y}) · Zona: ${loc.zone}</span>
    `;
    container.appendChild(row);
  });
}

export function renderReputation() {
  const container = document.getElementById("rep-list")!;
  container.innerHTML = "";
  FACTIONS.forEach(f => {
    const value = gameState.reputation[f.key as keyof typeof gameState.reputation];
    const row = document.createElement("div");
    row.className = "map-row";
    row.innerHTML = `
      <span><strong>${f.name}</strong></span>
      <span>${value} (${repStatus(value)})</span>
    `;
    container.appendChild(row);
  });
}

export function renderHistory() {
  const container = document.getElementById("history-list");
  if (!container) return;

  container.innerHTML = "";

  const history = gameState.missionHistory;
  if (!history || history.length === 0) {
    const div = document.createElement("div");
    div.className = "small";
    div.textContent = "Nenhuma missão registrada ainda. Vá fazer alguns trabalhos primeiro!";
    container.appendChild(div);
    return;
  }

  const recent = history.slice(-20).toReversed();

  recent.forEach((m: MissionHistoryEntry) => {
    const row = document.createElement("div");
    row.className = "map-row";

    const faction = FACTIONS.find(f => f.key === m.factionKey);
    const factionLabel = faction?.short ?? m.factionKey;

    const tipo =
      m.kind === "especial"
        ? formatTag("Missão Especial")
        : formatTag("Normal");

    const status =
      m.status === "failure"
        ? formatTag("Falha", "danger")
        : m.status === "partial"
          ? formatTag("Parcial", "warning")
          : formatTag("Concluída");

    row.innerHTML = `
      <span>
        <strong>${m.title}</strong><br>
        Dia ${m.day} · ${factionLabel}
      </span>
      <span>
        ${tipo} ${status}<br>
        Recompensa: ${m.reward} cr
      </span>
    `;
    container.appendChild(row);
  });
}
