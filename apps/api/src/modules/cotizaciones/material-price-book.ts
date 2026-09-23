/**
 * Baseline shop rates for Ciudad Juárez / border maquila (USD).
 * Used as anchors when live market research is sparse.
 * Review periodically — not a substitute for a formal quote.
 */
export type MaterialClass =
  | 'DELRIN'
  | 'ALUMINUM_6061'
  | 'ALUMINUM_TOOLING_PLATE'
  | 'SS_304'
  | 'SS_440'
  | 'OTHER';

export type MaterialBaseline = {
  class: MaterialClass;
  /** Rough raw stock allowance per typical small precision part (USD) */
  materialPerPartUsd: number;
  /** CNC cycle minutes estimate for a typical small part */
  cycleMin: number;
  /** Search queries for market research */
  searchQueries: string[];
  labels: string[];
};

export const SHOP_RATE_USD_PER_HOUR = 65; // CJ CNC shop ballpark
export const SETUP_MINUTES = 45;
export const MARGIN = 0.28; // 28% markup on cost
export const MIN_UNIT_PRICE_USD = 12;

export const MATERIAL_BOOK: MaterialBaseline[] = [
  {
    class: 'DELRIN',
    materialPerPartUsd: 8,
    cycleMin: 25,
    searchQueries: [
      'precio Delrin acetal Ciudad Juarez',
      'Delrin rod price per pound Mexico',
      'acetal black price USD lb',
    ],
    labels: ['DELRIN', 'ACETAL', 'POM'],
  },
  {
    class: 'ALUMINUM_6061',
    materialPerPartUsd: 6,
    cycleMin: 35,
    searchQueries: [
      'precio aluminio 6061 Ciudad Juarez',
      'Aluminum 6061 price per pound Mexico',
      '6061 aluminum bar stock USD',
    ],
    labels: ['6061', 'ALUMINUM 6061', 'ALUMINIUM 6061'],
  },
  {
    class: 'ALUMINUM_TOOLING_PLATE',
    materialPerPartUsd: 9,
    cycleMin: 40,
    searchQueries: [
      'aluminum tooling plate price',
      'precio placa aluminio tooling Mexico',
      'MIC 6 tooling plate price USD',
    ],
    labels: ['TOOLING PLATE', 'TOOLING', 'MIC6', 'MIC 6'],
  },
  {
    class: 'SS_304',
    materialPerPartUsd: 7,
    cycleMin: 50,
    searchQueries: [
      'precio acero inoxidable 304 Ciudad Juarez',
      '304 stainless steel price per pound Mexico',
      'SS 304 bar stock USD lb',
    ],
    labels: ['304 SS', '304', 'STAINLESS 304', 'INOX 304'],
  },
  {
    class: 'SS_440',
    materialPerPartUsd: 11,
    cycleMin: 55,
    searchQueries: [
      '440 stainless steel price',
      'precio acero 440C Mexico',
      '440C stainless bar USD',
    ],
    labels: ['440 SS', '440C', '440'],
  },
];

export function classifyMaterial(raw: string): MaterialBaseline {
  const u = (raw || '').toUpperCase();
  for (const m of MATERIAL_BOOK) {
    if (m.labels.some((l) => u.includes(l))) return m;
  }
  return {
    class: 'OTHER',
    materialPerPartUsd: 10,
    cycleMin: 40,
    searchQueries: [`${raw} price machining material Mexico`],
    labels: [],
  };
}

export function estimateUnitPriceUsd(opts: {
  material: MaterialBaseline;
  qty: number;
  /** Optional multiplier from market research (1 = baseline) */
  marketFactor?: number;
}): { unitPrice: number; breakdown: string } {
  const qty = Math.max(1, opts.qty);
  const factor = opts.marketFactor && opts.marketFactor > 0 ? opts.marketFactor : 1;
  const material = opts.material.materialPerPartUsd * factor;
  const setup = (SETUP_MINUTES / 60) * SHOP_RATE_USD_PER_HOUR;
  const cycle = (opts.material.cycleMin / 60) * SHOP_RATE_USD_PER_HOUR;
  const cost = material + setup / qty + cycle;
  const withMargin = cost * (1 + MARGIN);
  const unitPrice = Math.max(
    MIN_UNIT_PRICE_USD,
    Math.round(withMargin * 100) / 100,
  );
  const breakdown = `mat$${material.toFixed(2)}×${factor.toFixed(2)} + setup$${setup.toFixed(2)}/${qty} + cycle$${cycle.toFixed(2)} + margen${(MARGIN * 100).toFixed(0)}% @ $${SHOP_RATE_USD_PER_HOUR}/h CJ`;
  return { unitPrice, breakdown };
}
