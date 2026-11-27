/** Ranking mice by what they give when caught, for the rankings page. */

export interface RankedMouse {
  slug: string;
  name: string;
  group: string;
  /** Within the group, e.g. "Great Winter Hunt" in Event Mice; '' when there isn't one. */
  subgroup: string;
  points: number;
  gold: number;
  wisdom: number;
}

export type RankBy = 'points' | 'gold' | 'wisdom';

/** Highest first, ties by name. Mice with the same value share the rank of the first of them. */
export function rankMice(mice: RankedMouse[], by: RankBy): { mouse: RankedMouse; rank: number }[] {
  const sorted = [...mice].sort((a, b) => b[by] - a[by] || a.name.localeCompare(b.name));
  const rankOf = new Map<number, number>();
  sorted.forEach((mouse, index) => {
    if (!rankOf.has(mouse[by])) rankOf.set(mouse[by], index + 1);
  });
  return sorted.map((mouse) => ({ mouse, rank: rankOf.get(mouse[by]) ?? 0 }));
}
