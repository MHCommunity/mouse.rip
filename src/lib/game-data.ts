import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type {
  AttractionRow,
  ConvertibleRow,
  FoundInConvertible,
  GameItem,
  ItemDrops,
  MapRelation,
  MiceGroup,
  MiceRegion,
  Mouse,
  MouseMapRow,
} from '@/types';

// These datasets are large (multiple MB). We read them from disk at build time
// (pages are statically generated) instead of `import`-ing them, so they never
// get bundled into the Cloudflare runtime worker.
const DATA_DIR = path.join(process.cwd(), 'src/data/generated');

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')) as T;
}

/**
 * When scripts/update-data.js last actually refreshed the game data. The sitemap
 * reports this as lastmod — a file mtime would be wrong (a CI clone stamps every
 * file with the checkout time), and a lastmod that always reads "just now"
 * teaches crawlers to ignore it.
 */
export function getDataUpdatedAt(): Date {
  const { updatedAt } = readJson<{ updatedAt: string }>('data-updated.json');
  return new Date(updatedAt);
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
    groupsCache = readJson<MiceGroup[]>('mice-groups.json').sort((a, b) => a.display_order - b.display_order);
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

let regionsCache: MiceRegion[] | null = null;

function getAllMiceRegions(): MiceRegion[] {
  if (!regionsCache) regionsCache = readJson<MiceRegion[]>('mice-regions.json');
  return regionsCache;
}

let regionsByNameCache: Map<string, MiceRegion> | null = null;

/** The mice in a hunting region, looked up by the region's display name. */
export function getMiceForRegionName(name: string): Mouse[] {
  if (!regionsByNameCache) {
    regionsByNameCache = new Map(getAllMiceRegions().map((region) => [region.name.toLowerCase(), region]));
  }
  const region = regionsByNameCache.get(name.toLowerCase());
  if (!region) return [];
  const byId = new Map(getAllMice().map((mouse) => [mouse.id, mouse]));
  return region.mouse_ids.map((id) => byId.get(id)).filter((mouse): mouse is Mouse => Boolean(mouse));
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
      mice.map((mouse) => [mouse.id, { points: 0, gold: 0, wisdom: 0, total: mice.length }]),
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

let itemSlugByIdCache: Map<number, string> | null = null;

/** Resolve a MouseHunt item id to its item-page slug, if we have that item. */
export function itemSlugForId(id: number): string | undefined {
  if (!itemSlugByIdCache) {
    itemSlugByIdCache = new Map(getAllGameItems().map((item) => [item.id, itemSlug(item.type)]));
  }
  return itemSlugByIdCache.get(id);
}

let mapRelationsCache: MapRelation[] | null = null;

/**
 * Scroll-case → map → treasure-chest relations touching a given item, whether
 * that item is the scroll case or one of the chests.
 */
export function getMapRelationsForItem(itemId: number): MapRelation[] {
  if (!mapRelationsCache) {
    mapRelationsCache = readJson<MapRelation[]>('map-relations.json');
  }
  return mapRelationsCache.filter(
    (relation) => relation.scrollCase.id === itemId || relation.chests.some((chest) => chest.id === itemId),
  );
}

let foundInCache: Record<string, Omit<FoundInConvertible, 'slug'>[]> | null = null;

/** The convertibles (chests, gift baskets…) that an item can come out of. */
export function getConvertiblesContaining(itemId: number): FoundInConvertible[] {
  if (!foundInCache) {
    foundInCache = readJson<Record<string, Omit<FoundInConvertible, 'slug'>[]>>('item-found-in.json');
  }
  return (foundInCache[String(itemId)] ?? []).map((source) => ({
    ...source,
    slug: source.id ? itemSlugForId(source.id) : undefined,
  }));
}

let contentsCache: Record<string, ConvertibleRow[]> | null = null;

/** What a convertible opens into, best odds first, with reward pages linked. */
export function getConvertibleContents(itemId: number): ConvertibleRow[] {
  if (!contentsCache) {
    contentsCache = readJson<Record<string, ConvertibleRow[]>>('convertible-contents.json');
  }
  return (contentsCache[String(itemId)] ?? []).map((row) => ({
    ...row,
    slug: itemSlugForId(row.id),
  }));
}

let dropsCache: Record<string, ItemDrops> | null = null;

/**
 * The locations and cheeses that drop a given item (from MHCT). `rows` holds the
 * 50 best; `total` is how many combinations MHCT has actually recorded, so the
 * page can say what it's leaving out.
 */
export function getItemDrops(itemId: number): ItemDrops {
  if (!dropsCache) {
    dropsCache = readJson<Record<string, ItemDrops>>('item-drops.json');
  }
  return dropsCache[String(itemId)] ?? { rows: [], total: 0 };
}

let attractionCache: Record<string, AttractionRow[]> | null = null;

/** Where a mouse is attracted and how often, best rate first (from MHCT). */
export function getMouseAttraction(mouseId: number): AttractionRow[] {
  if (!attractionCache) {
    attractionCache = readJson<Record<string, AttractionRow[]>>('mice-attraction.json');
  }
  return attractionCache[String(mouseId)] ?? [];
}

let mouseMapsCache: Record<string, MouseMapRow[]> | null = null;

/** The treasure maps a mouse can turn up on (from MHCT). */
export function getMouseMaps(mouseId: number): MouseMapRow[] {
  if (!mouseMapsCache) {
    mouseMapsCache = readJson<Record<string, MouseMapRow[]>>('mouse-maps.json');
  }
  return mouseMapsCache[String(mouseId)] ?? [];
}
