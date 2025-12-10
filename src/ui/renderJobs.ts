import { Job } from "../core/models";
import { gameState } from "../core/state";
import { acceptJob } from "../systems/jobs";
import { formatTag } from "./formatters";
import { renderCrew } from "./renderCrew";
import { renderState } from "./renderState";

export function renderJobs() {
  const container = document.getElementById("jobs-list")!;
  container.innerHTML = "";

  gameState.jobs.forEach((job: Job) => {
    const card = document.createElement("div");
    card.className = "job-card";

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
