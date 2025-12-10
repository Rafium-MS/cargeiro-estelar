import { CrewMember } from "../core/models";
import { gameState } from "../core/state";
import { fireCrew, hireCrew } from "../systems/crew";
import { formatCrewEffects, formatTag } from "./formatters";
import { renderState } from "./renderState";

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

  gameState.crew.forEach((member: CrewMember) => {
    const div = document.createElement("div");
    div.className = "crew-member";

    const left = document.createElement("div");
    left.innerHTML = `
      <div class="crew-info-main">${member.name}</div>
      <div class="crew-info-meta">
        ${formatTag(member.role)}
        Nível base ${member.skill} · Moral ${member.morale} · Fadiga ${member.fatigue}<br>
        ${member.salaryPerDay} cr/dia<br>
        ${formatCrewEffects(member.effects)}
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

  gameState.crewCandidates.forEach((c: CrewMember) => {
    const card = document.createElement("div");
    card.className = "crew-candidate";

    const info = document.createElement("div");
    info.innerHTML = `
      <div class="crew-info-main">${c.name}</div>
      <div class="crew-info-meta">
        ${formatTag(c.role)}
        Nível ${c.skill} · Moral ${c.morale} · Fadiga ${c.fatigue} · ${c.salaryPerDay} cr/dia<br>
        ${formatCrewEffects(c.effects)}
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
