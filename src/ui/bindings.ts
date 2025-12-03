// src/ui/render.ts
import { gameState } from "../core/state";
import { MAP_LOCATIONS, FACTIONS, repStatus } from "../core/data";
import { getCrewStats, fireCrew, hireCrew } from "../systems/crew";
import { acceptJob } from "../systems/jobs";
import { addLog } from "./log";

export function renderState() {
  (document.getElementById("ship-name") as HTMLElement).textContent = gameState.ship.name;
  (document.getElementById("day") as HTMLElement).textContent = String(gameState.day);
  (document.getElementById("credits") as HTMLElement).textContent = `${gameState.credits} cr`;
  (document.getElementById("hull") as HTMLElement).textContent =
    `${gameState.ship.hull}% / ${gameState.ship.maxHull}%`;
  (document.getElementById("fuel") as HTMLElement).textContent =
    `${gameState.ship.fuel} / ${gameState.ship.maxFuel}`;
  (document.getElementById("cargo") as HTMLElement).textContent =
    `${gameState.ship.cargoCapacity} unidades máx.`;
  (document.getElementById("location") as HTMLElement).textContent = gameState.location;

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

  renderUpgrades();
  renderMap();
  renderReputation();
}

export function renderJobs() {
  const container = document.getElementById("jobs-list")!;
  container.innerHTML = "";

  gameState.jobs.forEach((job: any) => {
    const card = document.createElement("div");
    card.className = "job-card";

    const main = document.createElement("div");
    main.className = "job-main";

    const storyHeader = job.isStory
      ? `<div><span class="tag">Missão Especial</span> <strong>${job.storyTitle}</strong></div>`
      : "";

    const summary = job.isStory && job.storySummary
      ? `<div class="small">${job.storySummary}</div>`
      : "";

    main.innerHTML = `
      ${storyHeader}
      <strong>${job.origin}</strong> → <strong>${job.destination}</strong><br>
      Carga: ${job.cargoAmount} u (${job.cargoType.name}) · Pagamento: ${job.pay} cr
      ${summary}
    `;

    const meta = document.createElement("div");
    meta.className = "job-meta";
    meta.innerHTML = `
      <span class="tag">${job.cargoType.descShort}</span>
      <span class="tag">${job.clientFactionShort}</span><br>
      Distância: ${job.distance} UA<br>
      Zonas: ${job.originZone} → ${job.destinationZone}<br>
      Combustível: ${job.fuelCost} · Risco base: ${job.riskBase}%
    `;

    const button = document.createElement("button");
    button.textContent = "Aceitar trabalho";
    button.onclick = () => {
      acceptJob(job.id);
      renderState();
      renderCrew();
      renderJobs();
    };

    card.appendChild(main);
    card.appendChild(meta);
    card.appendChild(button);
    container.appendChild(card);
  });
}

export function renderCrew() {
  const list = document.getElementById("crew-list")!;
  list.innerHTML = "";

  if (gameState.crew.length === 0) {
    const div = document.createElement("div");
    div.className = "small";
    div.textContent = "Nenhum tripulante. Você está tocando essa nave no modo raiz.";
    list.appendChild(div);
    return;
  }

  gameState.crew.forEach((member: any) => {
    const div = document.createElement("div");
    div.className = "crew-member";

    const left = document.createElement("div");
    left.innerHTML = `
      <div class="crew-info-main">${member.name}</div>
      <div class="crew-info-meta">
        <span class="tag">${member.role}</span>
        Nível base ${member.skill} · Moral ${member.morale} · Fadiga ${member.fatigue}<br>
        ${member.salaryPerDay} cr/dia
      </div>
    `;

    const right = document.createElement("div");
    const btnFire = document.createElement("button");
    btnFire.textContent = "Demitir";
    btnFire.onclick = () => {
      fireCrew(member.id);
      renderCrew();
      renderState();
    };
    right.appendChild(btnFire);

    div.appendChild(left);
    div.appendChild(right);
    list.appendChild(div);
  });
}

export function renderCrewCandidates() {
  const container = document.getElementById("crew-candidates")!;
  container.innerHTML = "";

  if (gameState.crewCandidates.length === 0) {
    const div = document.createElement("div");
    div.className = "small";
    div.textContent = "Nenhum candidato no momento. Clique em 'Gerar candidatos' para ver quem está disponível.";
    container.appendChild(div);
    return;
  }

  gameState.crewCandidates.forEach((c: any) => {
    const card = document.createElement("div");
    card.className = "crew-candidate";

    const info = document.createElement("div");
    info.innerHTML = `
      <div class="crew-info-main">${c.name}</div>
      <div class="crew-info-meta">
        <span class="tag">${c.role}</span>
        Nível ${c.skill} · Moral ${c.morale} · Fadiga ${c.fatigue} · ${c.salaryPerDay} cr/dia
      </div>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Contratar";
    btn.onclick = () => {
      hireCrew(c.id);
      renderCrew();
      renderState();
      renderCrewCandidates();
    };

    card.appendChild(info);
    card.appendChild(btn);
    container.appendChild(card);
  });
}

function getUpgradeData(type: "hull" | "cargo" | "fuel" | "quarters") {
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

function upgradeShip(type: "hull" | "cargo" | "fuel" | "quarters") {
  const data = getUpgradeData(type);

  if (gameState.credits < data.cost) {
    addLog(`Créditos insuficientes para o upgrade "${data.name}".`, "warning");
    return;
  }

  gameState.credits -= data.cost;
  gameState.upgrades[type] = (gameState.upgrades[type] || 0) + 1;

  if (type === "hull") {
    gameState.ship.maxHull += 20;
    gameState.ship.hull = gameState.ship.maxHull;
  } else if (type === "cargo") {
    gameState.ship.cargoCapacity += 8;
  } else if (type === "fuel") {
    gameState.ship.maxFuel += 20;
    gameState.ship.fuel = gameState.ship.maxFuel;
  } else if (type === "quarters") {
    gameState.crewCapacity += 1;
  }

  renderState();
}

export function renderUpgrades() {
  const container = document.getElementById("upgrades-list")!;
  container.innerHTML = "";

  const types: ("hull" | "cargo" | "fuel" | "quarters")[] = ["hull", "cargo", "fuel", "quarters"];

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
    btn.onclick = () => upgradeShip(type);

    row.appendChild(info);
    row.appendChild(btn);
    container.appendChild(row);
  });
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

export function renderAll() {
  renderState();
  renderCrew();
  renderCrewCandidates();
  renderJobs();
}
