import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { GameItem, MiceGroup, MiceRegion, Mouse, MouseLoot, MouseLootEntry } from '@/types';

// These datasets are large (multiple MB). We read them from disk at build time
// (pages are statically generated) instead of `import`-ing them, so they never
// get bundled into the Cloudflare runtime worker.
const DATA_DIR = path.join(process.cwd(), 'src/data/generated');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')) as T;
}

export function mouseSlug(type: string): string {
  return type.replaceAll('_', '-');
}

export function itemSlug(type: string): string {
  return type.replaceAll('_', '-');
}

let miceCache: Mouse[] | null = null;
let miceBySlugCache: Map<string, Mouse> | null = null;

export function getAllMice(): Mouse[] {
  if (!miceCache) miceCache = readJson<Mouse[]>('mice.json');
  return miceCache;
}

export function getMouseBySlug(slug: string): Mouse | undefined {
  if (!miceBySlugCache) {
    miceBySlugCache = new Map(getAllMice().map((mouse) => [mouseSlug(mouse.type), mouse]));
  }
  return miceBySlugCache.get(slug);
}

let groupsCache: MiceGroup[] | null = null;
let groupBySlugCache: Map<string, MiceGroup> | null = null;
let groupSlugByNameCache: Map<string, string> | null = null;

export function getAllMiceGroups(): MiceGroup[] {
  if (!groupsCache) {
    groupsCache = readJson<MiceGroup[]>('mice-groups.json').sort(
      (a, b) => a.display_order - b.display_order
    );
  }
  return groupsCache;
}

export function getMiceGroupBySlug(slug: string): MiceGroup | undefined {
  if (!groupBySlugCache) {
    groupBySlugCache = new Map(getAllMiceGroups().map((group) => [group.id, group]));
  }
  return groupBySlugCache.get(slug);
}

/** Map a mouse's `group` name to its group slug, for linking. */
export function groupSlugForName(name: string): string | undefined {
  if (!groupSlugByNameCache) {
    groupSlugByNameCache = new Map(getAllMiceGroups().map((group) => [group.name, group.id]));
  }
  return groupSlugByNameCache.get(name);
}

/** The mice in a group, in the group's listed order. */
export function getMiceForGroup(group: MiceGroup): Mouse[] {
  const byId = new Map(getAllMice().map((mouse) => [mouse.id, mouse]));
  return group.mouse_ids.map((id) => byId.get(id)).filter((mouse): mouse is Mouse => Boolean(mouse));
}

let regionsByNameCache: Map<string, MiceRegion> | null = null;

/** The mice in a hunting region, looked up by the region's display name. */
export function getMiceForRegionName(name: string): Mouse[] {
  if (!regionsByNameCache) {
    const regions = readJson<MiceRegion[]>('mice-regions.json');
    regionsByNameCache = new Map(regions.map((region) => [region.name.toLowerCase(), region]));
  }
  const region = regionsByNameCache.get(name.toLowerCase());
  if (!region) return [];
  const byId = new Map(getAllMice().map((mouse) => [mouse.id, mouse]));
  return region.mouse_ids
    .map((id) => byId.get(id))
    .filter((mouse): mouse is Mouse => Boolean(mouse));
}

export interface MouseRanks {
  points: number;
  gold: number;
  wisdom: number;
  total: number;
}

let mouseRanksCache: Map<number, MouseRanks> | null = null;

/** A mouse's 1-based rank among all mice by points, gold, and wisdom (ties share a rank). */
export function getMouseRanks(mouseId: number): MouseRanks | undefined {
  if (!mouseRanksCache) {
    const mice = getAllMice();
    const cache = new Map<number, MouseRanks>(
      mice.map((mouse) => [mouse.id, { points: 0, gold: 0, wisdom: 0, total: mice.length }])
    );
    for (const key of ['points', 'gold', 'wisdom'] as const) {
      const sorted = [...mice].sort((a, b) => b[key] - a[key]);
      let rank = 0;
      let previous: number | null = null;
      sorted.forEach((mouse, index) => {
        if (mouse[key] !== previous) {
          rank = index + 1;
          previous = mouse[key];
        }
        cache.get(mouse.id)![key] = rank;
      });
    }
    mouseRanksCache = cache;
  }
  return mouseRanksCache.get(mouseId);
}

let itemsCache: GameItem[] | null = null;
let itemsBySlugCache: Map<string, GameItem> | null = null;

export function getAllGameItems(): GameItem[] {
  if (!itemsCache) itemsCache = readJson<GameItem[]>('game-items.json');
  return itemsCache;
}

export function getGameItemBySlug(slug: string): GameItem | undefined {
  if (!itemsBySlugCache) {
    itemsBySlugCache = new Map(getAllGameItems().map((item) => [itemSlug(item.type), item]));
  }
  return itemsBySlugCache.get(slug);
}

let itemSlugByNameCache: Map<string, string> | null = null;

/** Resolve an item display name to its item-page slug, if we have that item. */
export function itemSlugForName(name: string): string | undefined {
  if (!itemSlugByNameCache) {
    itemSlugByNameCache = new Map(
      getAllGameItems().map((item) => [item.name.toLowerCase(), itemSlug(item.type)])
    );
  }
  return itemSlugByNameCache.get(name.trim().toLowerCase());
}

let mouseLootCache: MouseLoot | null = null;

/** Loot a given mouse drops (empty until the loot dataset is populated). */
export function getMouseLoot(mouseId: number): MouseLootEntry[] {
  if (!mouseLootCache) {
    try {
      mouseLootCache = readJson<MouseLoot>('mouse-loot.json');
    } catch {
      mouseLootCache = {};
    }
  }
  return mouseLootCache[String(mouseId)] ?? [];
}
