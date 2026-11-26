/** The rank-up calculator's arithmetic, kept apart from its form so it can be tested. */

export interface RankTitle {
  id: string;
  name: string;
  /** Total wisdom needed to reach this title. */
  wisdom: number;
  image: string;
}

/** Digits only, with an optional decimal part when `decimal` is set. */
export function cleanNumber(value: string, decimal = false): string {
  const stripped = value.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
  if (!decimal) return stripped;
  const [whole, ...rest] = stripped.split('.');
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole;
}

export interface RankUp {
  current: RankTitle;
  /** The title after the current one; undefined at the top. */
  next?: RankTitle;
  /** The title aimed for, always above the current one; undefined at the top. */
  target?: RankTitle;
  wisdom: number;
  /** Index of the highest title the wisdom reaches, which can be past the current one. */
  reached: number;
  /** Titles from the next one reached up to the target. */
  steps: RankTitle[];
  needed: number;
}

/**
 * Where a hunter stands and what's left to the target. `titles` are in order. Exact wisdom wins over the
 * title and progress; otherwise the hunter is placed `progress` percent of the way through their title.
 */
export function rankUp(
  titles: RankTitle[],
  {
    currentIndex,
    targetIndex,
    progress,
    exactWisdom,
  }: { currentIndex: number; targetIndex: number; progress: string; exactWisdom: string },
): RankUp {
  const current = titles[currentIndex];
  const next = titles[currentIndex + 1];
  const target = titles[Math.max(targetIndex, currentIndex + 1)] ?? next;

  const percent = Math.min(100, Number.parseFloat(progress) || 0);
  const wisdom = exactWisdom
    ? Number.parseInt(exactWisdom, 10)
    : current.wisdom + (next ? ((next.wisdom - current.wisdom) * percent) / 100 : 0);

  // Exact wisdom can be past the title picked, so read the title off the wisdom instead.
  const reached = titles.reduce((index, title, i) => (wisdom >= title.wisdom ? i : index), 0);
  const steps = target ? titles.slice(reached + 1, titles.indexOf(target) + 1) : [];
  const needed = target ? Math.max(0, Math.ceil(target.wisdom - wisdom)) : 0;

  return { current, next, target, wisdom, reached, steps, needed };
}

/** The mouse a hunter typed, by its full name or the short one ("Glazy" for Glazy Mouse). */
export function findMouseByName<T extends { name: string; abbreviated_name?: string }>(
  mice: T[] | null | undefined,
  name: string,
): T | undefined {
  const wanted = name.trim().toLowerCase();
  if (!wanted) return undefined;
  return mice?.find((m) => m.name.toLowerCase() === wanted || m.abbreviated_name?.toLowerCase() === wanted);
}
