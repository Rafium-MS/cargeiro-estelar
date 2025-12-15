// src/core/ships.ts
import { getStaticData, ShipData, ShipVisualData } from "./dataLoader";

export type ShipId = ShipData["id"];
export type ShipVisual = ShipVisualData;

export type ShipDefinition = {
  key: ShipId;
  name: string;
  tier: number;
  description: string;
  cargo: number;
  hull: number;
  fuel: number;
  crew: number;
  price: number;
  traits: string[];
  smugglerHold?: number;
  unlockHint?: string;
};

const { ships: shipsData, shipVisuals: shipVisualsData } = getStaticData();

export const SHIPS = shipsData;
export const SHIP_VISUALS = shipVisualsData;

const TRAIT_DESCRIPTIONS: Record<string, string> = {
  manutencao_barata: "Manutenção barata: custos de reparo -20%",
  versatil: "Versátil: nave neutra da curva, sem bônus nem penalidades.",
  consumo_otimizado: "Consumo otimizado: custo de combustível -10%",
  risco_reduzido: "Risco levemente menor em eventos de rota (-5% de risco efetivo).",
  casco_reforcado: "Estável: dano de piratas -15%",
  reparo_caro: "Mas: custo de reparo +10%",
  bonus_corporacao: "Nave de contrato: bônus +10% pagamento ao trabalhar para Corporações.",
  alvo_de_piratas: "Risco base +5% em zonas de piratas (é alvo muito visado).",
  alcance_estendido: "Alcance estendido: custo de combustível -15% em distâncias longas.",
  bonus_contrabando: "Contrabando discreto: missões de contrabando ganham +10% pagamento.",
  blindagem_reforcada: "Blindagem reforçada: dano de piratas -30%.",
  bonus_autoridades: "Boa fama com Autoridades: reputação +1 extra em entregas para Autoridades.",
  compartimentos_ocultos: "Compartimentos ocultos: chance -25% de evento ruim de fiscalização em contrabando.",
  limite_rep_autoridades: "Autoridades desconfiam mais: reputação máxima com Autoridades limitada.",
  economia_escala: "Economia de escala: missões com carga ≥ 60 unidades recebem +15% pagamento.",
  salarios_altos: "Mas: salários da tripulação são +20% mais caros.",
  assinatura_fantasma: "Assinatura fantasma: risco de eventos ruins -20% em geral.",
  rep_sindicato_minima: "Mestre do submundo: reputação com Sindicato nunca cai abaixo de 0."
};

function mapTraits(traits: ShipData["traits"]): string[] {
  return traits.map(trait => TRAIT_DESCRIPTIONS[trait] ?? trait);
}

function getSmugglerHold(traits: ShipData["traits"]): number | undefined {
  return traits.includes("compartimentos_ocultos") ? 20 : undefined;
}

export const SHIP_DEFINITIONS: ShipDefinition[] = SHIPS.map(ship => ({
  key: ship.id,
  name: ship.name,
  tier: ship.tier,
  description: ship.loreTagline,
  cargo: ship.maxCargo,
  hull: ship.maxHull,
  fuel: ship.maxFuel,
  crew: ship.maxCrew,
  price: ship.basePrice,
  traits: mapTraits(ship.traits),
  smugglerHold: getSmugglerHold(ship.traits)
}));

export function getShipDefinition(key: ShipId): ShipDefinition | undefined {
  return SHIP_DEFINITIONS.find(s => s.key === key);
}

export function getShipById(id: ShipId): ShipData | undefined {
  return SHIPS.find(s => s.id === id);
}

export function getShipVisual(id: ShipId): ShipVisual | undefined {
  return SHIP_VISUALS.find(s => s.id === id);
}
