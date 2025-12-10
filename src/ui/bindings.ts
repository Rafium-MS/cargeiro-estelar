import { generateCrewCandidates, rest } from "../systems/crew";
import { refuelShip } from "../systems/fuel";
import { generateJobs } from "../systems/jobs";
import { renderAll, renderCrewCandidates, renderJobs } from "./index";

function activateView(targetId: string) {
  const views = Array.from(document.querySelectorAll<HTMLElement>(".view"));
  const navButtons = Array.from(document.querySelectorAll<HTMLElement>(".nav-item"));

  views.forEach(view => view.classList.toggle("active", view.id === targetId));
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.target === targetId));
}

function initNavigation() {
  const navButtons = Array.from(document.querySelectorAll<HTMLElement>(".nav-item"));
  const firstTarget = navButtons[0]?.dataset.target;

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target) {
        activateView(target);
      }
    });
  });

  if (firstTarget) {
    activateView(firstTarget);
  }
}

export function initUIBindings() {
  initNavigation();

  document.getElementById("btn-new-jobs")?.addEventListener("click", () => {
    generateJobs();
    renderJobs();
  });

  document.getElementById("btn-new-candidates")?.addEventListener("click", () => {
    generateCrewCandidates();
    renderCrewCandidates();
  });

  document.getElementById("btn-rest")?.addEventListener("click", () => {
    rest();
    renderAll();
  });

  document.getElementById("btn-refuel")?.addEventListener("click", () => {
    refuelShip();
    renderAll();
  });
}
