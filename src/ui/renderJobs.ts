import { Job } from "../core/models";
import { gameServices } from "../core/services";
import { gameState } from "../core/state";
import { calculateJobEconomics } from "../systems/economy";
import { getFuelPrice, getPortFee } from "../core/economy";
import { formatTag } from "./formatters";

export function renderJobs() {
  const container = document.getElementById("jobs-list")!;
  container.innerHTML = "";

  gameState.jobs.forEach((job: Job) => {
    const card = document.createElement("div");
    card.className = "job-card";

    const economics = calculateJobEconomics(job);
    const fuelPrice = getFuelPrice(job.origin as Parameters<typeof getFuelPrice>[0]);
    const portFee = getPortFee(job.destinationZone as Parameters<typeof getPortFee>[0]);

    const formatCredits = (value: number) => value.toLocaleString("pt-BR");

    const main = document.createElement("div");
    main.className = "job-main";

    const storyHeader = job.isStory
      ? `<div>${formatTag("Missão Especial")} <strong>${job.storyTitle}</strong></div>`
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
      ${formatTag(job.cargoType.descShort)}
      ${formatTag(job.clientFactionShort)}<br>
      Distância: ${job.distance} UA<br>
      Zonas: ${job.originZone} → ${job.destinationZone}<br>
      Combustível: ${job.fuelCost} · Risco base: ${job.riskBase}%
    `;

    const economy = document.createElement("div");
    economy.className = "job-economy";
    const netClass = economics.netProfit < 0 ? "negative" : "";
    economy.innerHTML = `
      <div class="economy-row"><span>💰 Pagamento</span><span>${formatCredits(economics.payment)} cr</span></div>
      <div class="economy-row"><span>⛽ Combustível</span><span>-${formatCredits(economics.fuelCost)} cr</span></div>
      <div class="economy-row"><span>🧑‍✈️ Tripulação</span><span>-${formatCredits(economics.crewSalaries)} cr</span></div>
      <div class="economy-row"><span>⚓ Taxa portuária</span><span>-${formatCredits(economics.portFee)} cr</span></div>
      <div class="economy-row"><span>🛠️ Manutenção</span><span>-${formatCredits(economics.maintenanceCost)} cr</span></div>
      <div class="economy-row net ${netClass}"><span>Lucro líquido</span><span>${formatCredits(economics.netProfit)} cr</span></div>
      <div class="small">⛽ Preço em ${job.origin}: ${fuelPrice} cr/un · Docagem em ${job.destinationZone}: ${portFee} cr</div>
    `;

    const button = document.createElement("button");
    button.textContent = "Aceitar trabalho";
    button.onclick = () => gameServices.actions.acceptJob(job.id);

    card.appendChild(main);
    card.appendChild(meta);
    card.appendChild(economy);
    card.appendChild(button);
    container.appendChild(card);
  });
}
