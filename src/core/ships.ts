// src/core/ships.ts

export type ShipDefinition = {
  key: string;
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

export const SHIP_DEFINITIONS: ShipDefinition[] = [
  {
    key: "mula",
    name: "Pica-Pau Classe Mula",
    tier: 1,
    description: "Nave de segunda mão, remendada, típica de pequeno frete independente.",
    cargo: 18,
    hull: 80,
    fuel: 80,
    crew: 2,
    price: 0,
    traits: [
      "Manutenção barata: custos de reparo -20%",
      "Perfeita pra começar, mas escala mal"
    ]
  },
  {
    key: "lv-01",
    name: "Cargueiro LV-01",
    tier: 1,
    description: "Uma evolução tímida da Mula, padrão de setor para pequenos contratos.",
    cargo: 24,
    hull: 100,
    fuel: 100,
    crew: 3,
    price: 8000,
    traits: [
      "Versátil: nave neutra da curva, sem bônus nem penalidades."
    ]
  },
  {
    key: "caelum-runner",
    name: "Classe Caelum Runner",
    tier: 2,
    description: "Cargueiro leve rápido, popular entre corretores de fronteira.",
    cargo: 30,
    hull: 110,
    fuel: 130,
    crew: 4,
    price: 18000,
    traits: [
      "Consumo otimizado: custo de combustível -10%",
      "Risco levemente menor em eventos de rota (-5% de risco efetivo)."
    ]
  },
  {
    key: "orion-bulk",
    name: "Cargueiro Orion-Bulk",
    tier: 2,
    description: "Primeiro cargueiro que parece navio mesmo; bom para rotas fixas de lucro médio.",
    cargo: 40,
    hull: 130,
    fuel: 140,
    crew: 5,
    price: 30000,
    traits: [
      "Estável: dano de piratas -15%",
      "Mas: custo de reparo +10%"
    ]
  },
  {
    key: "dragao-draconis",
    name: "Dragão de Draconis",
    tier: 3,
    description: "Famosa na região como canhão de carga, mas vira alvo de cobiça.",
    cargo: 60,
    hull: 150,
    fuel: 160,
    crew: 7,
    price: 55000,
    traits: [
      "Nave de contrato: bônus +10% pagamento ao trabalhar para Corporações.",
      "Risco base +5% em zonas de piratas (é alvo muito visado)."
    ]
  },
  {
    key: "kaelum-long-haul",
    name: "Kaelum Long-Haul",
    tier: 3,
    description: "Especialista em rotas longas e perigosas, queridinha de contrabandistas profissionais.",
    cargo: 55,
    hull: 140,
    fuel: 200,
    crew: 6,
    price: 60000,
    traits: [
      "Alcance estendido: custo de combustível -15% em distâncias longas.",
      "Contrabando discreto: missões de contrabando ganham +10% pagamento."
    ]
  },
  {
    key: "vega-sentinel",
    name: "Vega Sentinel",
    tier: 4,
    description: "Cargueiro escoltado, muito usado em setores com fiscalização pesada.",
    cargo: 65,
    hull: 180,
    fuel: 180,
    crew: 8,
    price: 95000,
    traits: [
      "Blindagem reforçada: dano de piratas -30%.",
      "Boa fama com Autoridades: reputação +1 extra em entregas para Autoridades."
    ]
  },
  {
    key: "shadow-route",
    name: "Sindicato Shadow-Route",
    tier: 4,
    description: "Nave aparentemente comum, mas preparada com compartimentos ocultos.",
    cargo: 50,
    hull: 150,
    fuel: 190,
    crew: 7,
    price: 110000,
    smugglerHold: 20,
    traits: [
      "Compartimentos ocultos: chance -25% de evento ruim de fiscalização em contrabando.",
      "Autoridades desconfiam mais: reputação máxima com Autoridades limitada." 
    ]
  },
  {
    key: "leviata-orion",
    name: "Leviatã de Orion Prime",
    tier: 5,
    description: "Monstro industrial. Quem pilota isso quase vira uma empresa.",
    cargo: 100,
    hull: 220,
    fuel: 220,
    crew: 12,
    price: 180000,
    traits: [
      "Economia de escala: missões com carga ≥ 60 unidades recebem +15% pagamento.",
      "Mas: salários da tripulação são +20% mais caros."
    ]
  },
  {
    key: "fantasma-fronteira",
    name: "Fantasma da Fronteira",
    tier: 5,
    description: "Nave lendária de registro questionável; um pé na lenda urbana, outro no setor noir.",
    cargo: 80,
    hull: 200,
    fuel: 260,
    crew: 10,
    price: 220000,
    traits: [
      "Assinatura fantasma: risco de eventos ruins -20% em geral.",
      "Mestre do submundo: reputação com Sindicato nunca cai abaixo de 0.",
      "Pode ter um custo oculto de lore (atrai missões arriscadas)."
    ],
    unlockHint: "Talvez desbloqueada por evento de história."
  }
];

export function getShipDefinition(key: string): ShipDefinition | undefined {
  return SHIP_DEFINITIONS.find(s => s.key === key);
}
