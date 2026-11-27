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
  'stat',
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
  stat: 'Currencies, resources, codices, and other items you hold rather than arm.',
  map_piece: 'Keys, maps, and passes that unlock travel to new locations.',
  skin: 'Cosmetic skins that change how a trap looks.',
};

/** The game's internal names for charms ("trinket") and special items ("stat") aren't the ones players use. */
const CLASSIFICATION_NAMES: Record<string, string> = { trinket: 'Charm', stat: 'Special' };

/**
 * Sub-groups for the big types, mostly from the tags the game gives each item (the tabs in its own inventory),
 * and for convertibles the game doesn't tag, from the name. An item goes in the first one it matches;
 * anything else is "Other".
 */
export const SUBGROUPS: Record<string, { id: string; label: string; tag?: string; name?: RegExp }[]> = {
  stat: [
    { id: 'currency', label: 'Currency', tag: 'currency' },
    { id: 'resources', label: 'Resources', tag: 'resources' },
    { id: 'equipment', label: 'Equipment', tag: 'equipment' },
    { id: 'codex', label: 'Codices', tag: 'codex' },
    { id: 'cosmetics', label: 'Cosmetics', tag: 'cosmetics' },
    { id: 'theme_scraps', label: 'Theme scraps', tag: 'theme_scraps' },
    { id: 'vintage', label: 'Vintage', tag: 'vintage' },
  ],
  convertible: [
    { id: 'treasure_chests', label: 'Treasure chests', tag: 'treasure_chests' },
    { id: 'spring_hunt', label: 'Eggs', tag: 'spring_hunt' },
    { id: 'scroll_case', label: 'Scroll cases', tag: 'scroll_case' },
    { id: 'adventuring', label: 'Adventuring', tag: 'adventuring' },
    { id: 'kits', label: 'Kits and packs', name: /\b(kit|pack|bundle|crate|box|bag|satchel|stash|supply)\b/i },
    { id: 'gifts', label: 'Gifts', name: /\b(gift|basket|present|stocking|card)\b/i },
  ],
  crafting_item: [
    { id: 'equipment', label: 'Equipment', tag: 'equipment' },
    { id: 'cheese', label: 'Cheese', tag: 'cheese' },
    { id: 'trap_parts', label: 'Trap parts', tag: 'trap_parts' },
    { id: 'blueprints', label: 'Blueprints', tag: 'blueprints' },
    { id: 'theme_scraps', label: 'Theme scraps', tag: 'theme_scraps' },
    { id: 'charms', label: 'Charms', tag: 'charms' },
    { id: 'vintage', label: 'Vintage', tag: 'vintage' },
  ],
  collectible: [
    { id: 'theme', label: 'Journal themes', tag: 'theme' },
    { id: 'great_winter_hunt', label: 'Great Winter Hunt', tag: 'great_winter_hunt' },
    { id: 'lunar_new_year', label: 'Lunar New Year', tag: 'lunar_new_year' },
    { id: 'valentines', label: 'Valentine’s', tag: 'valentines' },
    { id: 'mousehunt_birthday', label: 'Birthday', tag: 'mousehunt_birthday' },
    { id: 'halloween', label: 'Halloween', tag: 'halloween' },
    { id: 'spring_hunt', label: 'Spring Egg Hunt', tag: 'spring_hunt' },
    { id: 'tournament', label: 'Tournaments', tag: 'tournament' },
  ],
};

export const OTHER_SUBGROUP = 'other';

/** The sub-group an item falls in, or undefined when its type isn't split up. */
export function itemSubgroup(item: { classification: string; tags?: string[]; name: string }): string | undefined {
  const groups = SUBGROUPS[item.classification];
  if (!groups) return undefined;
  const match = groups.find((group) =>
    group.tag ? Boolean(item.tags?.includes(group.tag)) : Boolean(group.name?.test(item.name)),
  );
  return match?.id ?? OTHER_SUBGROUP;
}

export function subgroupLabel(classification: string, id: string): string {
  return SUBGROUPS[classification]?.find((group) => group.id === id)?.label ?? 'Other';
}

/** A type's sub-groups that have items, in order, with Other last. */
export function subgroupsPresent(classification: string, ids: Iterable<string>): string[] {
  const present = new Set(ids);
  const groups = (SUBGROUPS[classification] ?? []).map((group) => group.id).filter((id) => present.has(id));
  return present.has(OTHER_SUBGROUP) ? [...groups, OTHER_SUBGROUP] : groups;
}

/** Singular display name for a classification, e.g. `crafting_item` → "Crafting Item". */
export function classificationName(key: string): string {
  return (
    CLASSIFICATION_NAMES[key] ??
    key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

/** Plurals that adding an "s" gets wrong. */
const CLASSIFICATION_LABELS: Record<string, string> = { stat: 'Special Items' };

/** Plural display name for a classification, e.g. `crafting_item` → "Crafting Items". */
export function classificationLabel(key: string): string {
  if (CLASSIFICATION_LABELS[key]) return CLASSIFICATION_LABELS[key];
  const words = classificationName(key);
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
