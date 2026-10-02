/** Friendlier classifications first; the rest follow alphabetically. */
export const CLASSIFICATION_ORDER = [
  'weapon',
  'base',
  'bait',
  'trinket',
  'potion',
  'crafting_item',
  'convertible',
  'collectible',
  'map_piece',
  'skin',
];

export const CLASSIFICATION_DESCRIPTIONS: Record<string, string> = {
  weapon: 'Traps that determine your setup’s power and power type.',
  base: 'Bases that sit under your trap and add power, luck, and other bonuses.',
  bait: 'Cheese and other bait used to attract mice.',
  trinket: 'Charms that add bonuses to your setup while armed.',
  potion: 'Potions that convert items into cheese and other goods.',
  crafting_item: 'Ingredients and materials used in crafting recipes.',
  convertible: 'Chests, gifts, and other openables with rewards inside.',
  collectible: 'Trophies, keepsakes, and other collectibles.',
  map_piece: 'Pieces used to assemble treasure maps.',
  skin: 'Cosmetic skins that change how a trap looks.',
};

/** Plural display name for a classification, e.g. `crafting_item` → "Crafting Items". */
export function classificationLabel(key: string): string {
  const words = key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return words.endsWith('s') ? words : `${words}s`;
}

/** Sort the classifications actually present, in our preferred order. */
export function orderClassifications(present: Iterable<string>): string[] {
  const set = new Set(present);
  return [
    ...CLASSIFICATION_ORDER.filter((key) => set.has(key)),
    ...[...set].filter((key) => !CLASSIFICATION_ORDER.includes(key)).sort(),
  ];
}
