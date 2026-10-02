// Queso Canyon resource / pump calculator.
//
// Ported from fysh's "Queso Canyon Resource Calculator" (v1.3, 2018). The
// crafting model: higher-tier Queso cheeses are crafted in batches from the
// next-lower tier plus Queso/Spice Leaves, and the base resource (Bland Queso)
// is obtained by pumping the volcano. Given a target amount of Nachore, this
// works out how many hunts and how much Bland Queso each cheese strategy costs.

export const CHEESE_NAMES = ['Bland Queso', 'Mild Queso', 'Medium Queso', 'Hot Queso', "Flamin' Queso"] as const;

// Bland Queso pumped per catch, by pump level (1–10).
export const PUMP_LEVELS = [1, 2, 5, 7, 12, 30, 40, 60, 150, 200] as const;

// Nachore needed for the next pump level, by current pump level (1–10).
export const NEXT_PUMP_NACHORE = [10, 25, 100, 150, 300, 1000, 2000, 3000, 5000, null] as const;

// Nachore earned per catch, by cheese tier (0 = Bland … 4 = Flamin').
const NACHORE_PER_CATCH = [0.695, 2.26, 7.618, 34.938, 109.935] as const;

// Leaves farmed per catch when hunting the tier below to make a given tier.
// Index = target tier (1 = Mild's Spice Leaves … 4 = Flamin's Queso Leaves).
const LEAF_RATE = [0, 2.902, 1.979, 1.409, 0.872] as const;

export interface PumpOptions {
  /** Target amount of Nachore. */
  nachore: number;
  /** Pump level, 1–10. */
  pumpLevel: number;
  /** Whether Magic Essence is used (doubles cheese yield per batch). */
  useMagicEssence: boolean;
  /** Whether the Overgrown Ember Stone Base is equipped (+50% pump). */
  useOesb: boolean;
  /** Whether Queso Pump Charms are armed (×2 pump). */
  useQpc: boolean;
}

export interface StrategyResult {
  /** Cheese tier index (0–4). */
  tier: number;
  /** Cheese name. */
  name: string;
  /** Total hunts required (hunting + leaf farming + pumping). */
  hunts: number;
  /** Total Bland Queso consumed. */
  blandQueso: number;
  /** Magic Essence consumed (only meaningful when useMagicEssence is true). */
  magicEssence: number;
  /** Queso Pump Charms consumed (only meaningful when useQpc is true). */
  pumpCharms: number;
  /** Hunts saved versus the opposite Magic Essence setting. */
  essenceSavedHunts: number;
  /** Percentage of hunts saved versus the opposite Magic Essence setting. */
  essenceSavedPercent: number;
}

function pumpRate({ pumpLevel, useOesb, useQpc }: PumpOptions): number {
  const qpc = useQpc ? 2 : 1;
  const oesb = useOesb ? 0.5 : 0;
  return PUMP_LEVELS[pumpLevel - 1] * (qpc + oesb);
}

// Total hunts for a tier with a specific essence multiplier (3 or 6).
function huntsForTier(
  tier: number,
  essence: number,
  options: PumpOptions,
): {
  hunts: number;
  blandQueso: number;
  magicEssence: number;
  pumpCharms: number;
} {
  const rate = pumpRate(options);

  if (tier === 0) {
    const catches = Math.ceil(options.nachore / NACHORE_PER_CATCH[0]);
    const pump = Math.ceil(catches / rate);
    return { hunts: catches + pump, blandQueso: catches, magicEssence: 0, pumpCharms: pump };
  }

  const catches = Math.ceil(options.nachore / NACHORE_PER_CATCH[tier]);

  const batches: number[] = [];
  const leafCatches: number[] = [];
  let prev = catches;
  for (let t = tier; t >= 1; t -= 1) {
    const b = Math.ceil(prev / essence);
    const leaves = b * 10;
    const lc = Math.ceil(leaves / LEAF_RATE[t]);
    batches[t] = b;
    leafCatches[t] = lc;
    prev = lc;
  }

  let blandQueso = leafCatches[1];
  let magicEssence = 0;
  let leafHunts = 0;
  for (let t = 1; t <= tier; t += 1) {
    blandQueso += batches[t] * 10 ** t;
    magicEssence += batches[t] * 3;
    leafHunts += leafCatches[t];
  }

  const pump = Math.ceil(blandQueso / rate);
  return {
    hunts: catches + leafHunts + pump,
    blandQueso,
    magicEssence,
    pumpCharms: pump,
  };
}

export function calculateStrategies(options: PumpOptions): StrategyResult[] {
  if (!Number.isFinite(options.nachore) || options.nachore <= 0) {
    return [];
  }

  const essence = options.useMagicEssence ? 6 : 3;
  const altEssence = options.useMagicEssence ? 3 : 6;

  return CHEESE_NAMES.map((name, tier) => {
    const main = huntsForTier(tier, essence, options);
    const alt = huntsForTier(tier, altEssence, options);

    const savedHunts = Math.abs(main.hunts - alt.hunts);
    const denom = Math.max(main.hunts, alt.hunts);
    const savedPercent = denom > 0 ? (savedHunts * 100) / denom : 0;

    return {
      tier,
      name,
      hunts: main.hunts,
      blandQueso: main.blandQueso,
      magicEssence: main.magicEssence,
      pumpCharms: main.pumpCharms,
      essenceSavedHunts: savedHunts,
      essenceSavedPercent: savedPercent,
    };
  });
}

export function bestStrategy(strategies: StrategyResult[]): StrategyResult | null {
  if (!strategies.length) {
    return null;
  }
  return strategies.reduce((best, s) => (s.hunts < best.hunts ? s : best));
}

export function effectivePumpRate(options: PumpOptions): number {
  return pumpRate(options);
}
