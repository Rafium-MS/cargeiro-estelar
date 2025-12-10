// src/main.ts
import { gameServices } from "./core/services";
import { addLog } from "./core/services/log";
import { renderAll } from "./ui";
import { initUIBindings } from "./ui/bindings";
import { renderLog } from "./ui/log";

function initGame() {
  gameServices.subscribe(() => {
    renderAll();
    renderLog();
  });

  addLog(
    "Bem-vindo ao comando do Cargueiro LV-01. Sua fama no setor vai destravar missões especiais com história própria.",
    "good"
  );

  renderAll();
  renderLog();
  gameServices.actions.generateJobs();
  initUIBindings();
}

initGame();
