import type { AttractionRow } from '@/types';

/** Rows from fewer hunts than this are noise; only fall back to them when nothing better exists. */
export const MIN_SAMPLE = 100;

/**
 * The most useful single place to hunt a mouse: the highest rate without a charm,
 * preferring rows with a real sample (MH-Tools rows have none and count as fine).
 * Used by the mouse page, its metadata and structured data. Keep in step with
 * bestSpot() in scripts/update-data.js, which bakes the same answer into the
 * search index from the same stored rows.
 */
export function bestAttractionRow(rows: AttractionRow[]): AttractionRow | undefined {
  const plain = rows.filter((row) => !row.charm);
  const pool = plain.length > 0 ? plain : rows;
  const trusted = pool.filter((row) => row.total_hunts === null || row.total_hunts >= MIN_SAMPLE);
  return (trusted.length > 0 ? trusted : pool).reduce<AttractionRow | undefined>(
    (best, row) => (!best || row.rate > best.rate ? row : best),
    undefined,
  );
}
