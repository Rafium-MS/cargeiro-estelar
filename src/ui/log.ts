// src/ui/log.ts
import { LogEntry } from "../core/models";
import { gameState } from "../core/state";

export function addLog(message: string, type: "" | "danger" | "warning" | "good" = "") {
  const entry: LogEntry = {
    day: gameState.day,
    message,
    type
  };
  gameState.log.unshift(entry);
  renderLog();
}

export function renderLog() {
  const logEl = document.getElementById("log");
  if (!logEl) return;

  logEl.innerHTML = "";
  gameState.log.forEach((entry: LogEntry) => {
    const div = document.createElement("div");
    div.className = "log-entry";
    if (entry.type === "danger") div.classList.add("danger");
    if (entry.type === "warning") div.classList.add("warning");
    if (entry.type === "good") div.classList.add("good");

    div.innerHTML = `<span class="time">[Dia ${entry.day}]</span> ${entry.message}`;
    logEl.appendChild(div);
  });
}
