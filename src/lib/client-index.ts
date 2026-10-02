/**
 * The item and mouse data that reaches the browser.
 *
 * Both files are code-split and fetched on demand, and everything that needs
 * them — site search, the /items and /mice browsers, /marketplace — goes through
 * here. That's deliberate: these are the same lists, so sharing one lazily-loaded
 * chunk each means a visitor downloads them at most once for the whole session,
 * instead of every page inlining its own copy into the HTML it ships.
 */

import type { SlimMouse } from '@/types';

export interface IndexedItem {
  id: number;
  name: string;
  /** Underscored game type; the item-page slug is this with dashes. */
  type: string;
  classification: string;
  tradable?: boolean;
  tags?: string[];
}

/** The search index's mouse, plus what the /mice browser filters on. */
export type IndexedMouse = SlimMouse & {
  /** Non-zero power-type effectivenesses; feed to bestPowerTypes(). */
  eff?: Record<string, number>;
};

/** JSON imports arrive as a module namespace under bundlers, or bare under others. */
function unwrap<T>(mod: unknown): T[] {
  const value = (mod as { default?: T[] }).default ?? (mod as T[]);
  return Array.isArray(value) ? value : [];
}

let itemsPromise: Promise<IndexedItem[]> | null = null;
let micePromise: Promise<IndexedMouse[]> | null = null;

export function loadItemIndex(): Promise<IndexedItem[]> {
  if (!itemsPromise) {
    itemsPromise = import('@/data/generated/game-items-search.json')
      .then((mod) => unwrap<IndexedItem>(mod))
      .catch((error) => {
        // Don't cache the failure — the next caller should be able to retry.
        itemsPromise = null;
        throw error;
      });
  }
  return itemsPromise;
}

export function loadMouseIndex(): Promise<IndexedMouse[]> {
  if (!micePromise) {
    micePromise = import('@/data/generated/mice-search.json')
      .then((mod) => unwrap<IndexedMouse>(mod))
      .catch((error) => {
        micePromise = null;
        throw error;
      });
  }
  return micePromise;
}

/** item id → item-page slug, for cross-linking rows that only carry an id. */
export function itemSlugsById(items: IndexedItem[]): Record<number, string> {
  const slugs: Record<number, string> = {};
  for (const item of items) slugs[item.id] = item.type.replaceAll('_', '-');
  return slugs;
}
