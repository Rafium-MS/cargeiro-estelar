import { CrewEffect } from "../core/models";

export function formatTag(label: string, variant?: "danger" | "warning") {
  const classes = ["tag", variant].filter(Boolean).join(" ");
  return `<span class="${classes}">${label}</span>`;
}

export function formatCrewEffects(effects?: CrewEffect[]) {
  return (effects || [])
    .map(effect => `${effect.name} – ${effect.description}`)
    .join(" · ") || "Sem efeitos";
}
