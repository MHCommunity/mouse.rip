// The nine MouseHunt power types, with display labels and themed chip colors.
export const POWER_TYPES = [
  'arcane',
  'draconic',
  'forgotten',
  'hydro',
  'law',
  'physical',
  'rift',
  'shadow',
  'tactical',
] as const;

export type PowerType = (typeof POWER_TYPES)[number];

export const POWER_TYPE_LABELS: Record<string, string> = {
  arcane: 'Arcane',
  draconic: 'Draconic',
  forgotten: 'Forgotten',
  hydro: 'Hydro',
  law: 'Law',
  physical: 'Physical',
  rift: 'Rift',
  shadow: 'Shadow',
  tactical: 'Tactical',
  power: 'Power',
};

// Chip styling per power type, loosely following the in-game color conventions.
export const POWER_TYPE_CHIP: Record<string, string> = {
  arcane: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  draconic: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  forgotten: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  hydro: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  law: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  physical: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
  rift: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  shadow: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  tactical: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
};

export function powerTypeLabel(type: string): string {
  return POWER_TYPE_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * The power type(s) a mouse is most vulnerable to — those with the highest
 * effectiveness. Returns an empty array if no type is effective.
 */
export function bestPowerTypes(effectivenesses?: Record<string, number | undefined>): string[] {
  if (!effectivenesses) return [];
  const entries = POWER_TYPES.map((type) => [type, effectivenesses[type] ?? 0] as const).filter(
    ([, value]) => value > 0,
  );
  if (entries.length === 0) return [];
  const max = Math.max(...entries.map(([, value]) => value));
  return entries.filter(([, value]) => value === max).map(([type]) => type);
}

/**
 * Turns a game description (which uses `<br />` and the odd inline tag) into an
 * array of clean paragraph strings.
 */
export function descriptionToParagraphs(description?: string): string[] {
  if (!description) return [];
  return description
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
