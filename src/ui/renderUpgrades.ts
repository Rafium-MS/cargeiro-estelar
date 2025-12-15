import { UpgradeType } from "../core/models";
import { gameServices } from "../core/services";
import { gameState } from "../core/state";
import { getShipyardCatalog, getShipTraitSummary } from "../systems/shipyard";
import { getShipUnlockHint, isShipUnlocked } from "../systems/progression";

function getUpgradeData(type: UpgradeType) {
  const level = gameState.upgrades[type] || 0;

  const baseCosts: Record<string, number> = {
    hull: 500,
    cargo: 400,
    fuel: 450,
    quarters: 600
  };

  const perLevel = 250;
  const cost = baseCosts[type] + level * perLevel;

  let name: string;
  let desc: string;
  if (type === "hull") {
    name = "Reforço de Casco";
    desc = "+20 à integridade máxima do casco, totalmente reparado no upgrade.";
  } else if (type === "cargo") {
    name = "Módulos de Carga";
    desc = "+8 de capacidade de carga.";
  } else if (type === "fuel") {
    name = "Tanque Estendido";
    desc = "+20 de combustível máximo (tanque cheio ao instalar).";
  } else {
    name = "Alojamentos Extras";
    desc = "+1 de capacidade de tripulação.";
  }

  return { type, name, level, cost, desc };
}

export function renderUpgrades() {
  const container = document.getElementById("upgrades-list")!;
  container.innerHTML = "";

  const types: UpgradeType[] = ["hull", "cargo", "fuel", "quarters"];

  types.forEach(type => {
    const data = getUpgradeData(type);

    const row = document.createElement("div");
    row.className = "upgrade-row";

    const info = document.createElement("div");
    info.innerHTML = `
      <div class="upgrade-info-main">${data.name} (Nível ${data.level})</div>
      <div class="upgrade-info-meta">
        Custo: ${data.cost} cr<br>
        ${data.desc}
      </div>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Upgrade";
    btn.onclick = () => gameServices.actions.upgradeShip(type);

    row.appendChild(info);
    row.appendChild(btn);
    container.appendChild(row);
  });
}

export function renderShipyard() {
  const container = document.getElementById("shipyard-list");
  if (!container) return;

  container.innerHTML = "";
  const catalog = getShipyardCatalog();

  catalog.forEach(ship => {
    const card = document.createElement("div");
    const unlocked = isShipUnlocked(ship.key);
    card.className = unlocked ? "ship-card" : "ship-card locked";

    const header = document.createElement("div");
    header.className = "ship-card-header";
    header.innerHTML = `
      <div>
        <div class="ship-name">${ship.name}</div>
        <div class="small">Tier ${ship.tier}</div>
      </div>
      <div class="tag">${ship.price} cr</div>
    `;

    const desc = document.createElement("div");
    desc.className = "ship-card-desc";
    desc.textContent = ship.description;

    const stats = document.createElement("div");
    stats.className = "ship-card-stats";
    const cargoText = ship.smugglerHold
      ? `${ship.cargo}u (+${ship.smugglerHold}u ocultas)`
      : `${ship.cargo}u`;
    stats.textContent = `Carga ${cargoText} · Casco ${ship.hull} · Combustível ${ship.fuel} · Tripulação ${ship.crew}`;

    const traits = document.createElement("div");
    traits.className = "ship-card-traits";
    traits.textContent = getShipTraitSummary(ship);
    const unlockHint = getShipUnlockHint(ship.key);
    if (unlockHint) {
      const hint = document.createElement("div");
      hint.className = "ship-card-hint";
      hint.textContent = unlockHint;
      traits.appendChild(hint);
    }

    const actions = document.createElement("div");
    actions.className = "ship-card-actions";
    const btn = document.createElement("button");
    const isCurrent = ship.key === gameState.ship.key;
    if (!unlocked) {
      btn.textContent = "Bloqueada";
      btn.disabled = true;
    } else {
      btn.textContent = isCurrent ? "Em operação" : `Adquirir (${ship.price} cr)`;
      btn.disabled = isCurrent || gameState.credits < ship.price;
      btn.onclick = () => gameServices.actions.switchShip(ship.key);
    }
    actions.appendChild(btn);

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(stats);
    card.appendChild(traits);
    card.appendChild(actions);
    container.appendChild(card);
  });
}
