// src/core/data.ts

export const MAP_LOCATIONS = [
  { name: "Estação Alfa-3", x: 0,  y: 0,  zone: "Núcleo" },
  { name: "Anel Orbital de Vega", x: 4,  y: 1,  zone: "Zona de Fiscalização" },
  { name: "Porto Espacial Orion Prime", x: -3, y: 2, zone: "Núcleo" },
  { name: "Colônia Fronteira Kaelum", x: 7,  y: -2, zone: "Fronteira" },
  { name: "Entreposto Asteroidal 7-G", x: 10, y: -4, zone: "Zona de Piratas" },
  { name: "Terminal Mercante Draconis", x: 2,  y: -6, zone: "Zona de Fiscalização" },
  { name: "Plataforma Helix-9", x: -5, y: -1, zone: "Núcleo" },
  { name: "Observatório Aurora", x: -1, y: 6,  zone: "Zona de Fiscalização" },
  { name: "Ponto de Reabastecimento Kuiper", x: 9,  y: 3,  zone: "Fronteira" },
  { name: "Enclave Livre Altair", x: 5,  y: 5,  zone: "Fronteira" },
  { name: "Mina Profunda Kor-21", x: 12, y: -7, zone: "Zona de Piratas" }
];

export const FACTIONS = [
  { key: "authorities", name: "Autoridades do Setor", short: "Autoridades" },
  { key: "corporations", name: "Mega Corporações", short: "Corporações" },
  { key: "syndicate", name: "Sindicato do Submundo", short: "Sindicato" }
];

export const ROLES = [
  { role: "Piloto", key: "pilot" },
  { role: "Engenheiro", key: "engineer" },
  { role: "Segurança", key: "security" },
  { role: "Logística", key: "logistics" }
];

export const NAME_POOL = [
  "Rhea Solari",
  "Kael Drummond",
  "Nova Ícaro",
  "Tessa Venn",
  "Jax Corvin",
  "Nilo Faris",
  "Zara Quinn",
  "Lio Rendar",
  "Mira Sol",
  "Dax Holden"
];

export const CARGO_TYPES = [
  {
    key: "legal",
    name: "Carga Legal",
    descShort: "Legal",
    descLong: "Mercadorias registradas. Risco normal.",
    riskMod: 0,
    payMult: 1
  },
  {
    key: "fragile",
    name: "Carga Frágil",
    descShort: "Frágil",
    descLong: "Itens sensíveis. Pagam melhor, mas podem gerar prejuízos em danos.",
    riskMod: 10,
    payMult: 1.3
  },
  {
    key: "smuggle",
    name: "Contrabando",
    descShort: "Contrabando",
    descLong: "Carga ilegal. Pagamento altíssimo, risco de fiscalização pesada.",
    riskMod: 20,
    payMult: 1.8
  }
];

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function chooseRandom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function repStatus(value: number): string {
  if (value <= -60) return "Hostil";
  if (value <= -20) return "Desconfiado";
  if (value < 20) return "Neutro";
  if (value < 50) return "Amigável";
  return "Aliado";
}

export function zoneRiskModifier(zone: string): number {
  if (zone === "Zona de Piratas") return 20;
  if (zone === "Zona de Fiscalização") return 10;
  if (zone === "Fronteira") return 5;
  return 0;
}
