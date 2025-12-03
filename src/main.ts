// src/main.ts
import { renderAll } from "./ui/render";
import { generateJobs } from "./systems/jobs";
import { initUIBindings } from "./ui/bindings";
import { addLog } from "./ui/log";

function initGame() {
  addLog("Bem-vindo ao comando do Cargueiro LV-01. Sua fama no setor vai destravar missões especiais com história própria.", "good");
  renderAll();
  generateJobs();
  renderAll();
  initUIBindings();
}

initGame();
