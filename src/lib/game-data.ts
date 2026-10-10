import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type {
  AttractionRow,
  ConvertibleRow,
  FoundInConvertible,
  GameItem,
  ItemDropRow,
  ItemDropper,
  ItemDrops,
  ItemDropsData,
  LocationLootRow,
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

let dropsCache: Record<string, ItemDropsData> | null = null;

let mouseSlugByIdCache: Map<number, string> | null = null;

function mouseSlugForId(id: number): string | undefined {
  if (!mouseSlugByIdCache) {
    mouseSlugByIdCache = new Map(getAllMice().map((mouse) => [mouse.id, mouseSlug(mouse.type)]));
  }
  return mouseSlugByIdCache.get(id);
}

/**
 * The mice that drop a given item (from MHCT), one row each, best first. A mouse
 * that drops it everywhere it's caught would otherwise fill the table with one
 * row per location. `total` is how many mouse/location rows MHCT has, so the
 * page can say what it's leaving out.
 */
export function getItemDrops(itemId: number): ItemDrops {
  const drops = getAllItemDrops()[String(itemId)];
  if (!drops) return { rows: [], total: 0 };

  const byMouse = new Map<number, ItemDropRow[]>();
  for (const row of drops.rows) {
    byMouse.set(row.mouse_id, [...(byMouse.get(row.mouse_id) ?? []), row]);
  }

  const rows: ItemDropper[] = [...byMouse.values()].map((mouseRows) => {
    const sorted = [...mouseRows].sort((a, b) => b.catches - a.catches);
    const catches = sorted.reduce((sum, row) => sum + row.catches, 0);
    const dropped = sorted.reduce((sum, row) => sum + (row.drop_likelihood / 100) * row.catches, 0);
    return {
      mouse_id: sorted[0].mouse_id,
      mouse_name: sorted[0].mouse_name,
      mouse_slug: mouseSlugForId(sorted[0].mouse_id),
      location: sorted[0].location,
      locations: sorted.map((row) => row.location),
      catches,
      drop_likelihood: Math.round((10000 * dropped) / catches) / 100,
      min: Math.min(...sorted.map((row) => row.min)),
      max: Math.max(...sorted.map((row) => row.max)),
    };
  });
  rows.sort((a, b) => b.drop_likelihood - a.drop_likelihood || b.catches - a.catches);

  return { rows, total: drops.total };
}

function getAllItemDrops(): Record<string, ItemDropsData> {
  if (!dropsCache) {
    dropsCache = readJson<Record<string, ItemDropsData>>('item-drops.json');
  }
  return dropsCache;
}

// From one mouse at a location, a small sample is mostly charm effects and event loot.
const MIN_LOCATION_LOOT_CATCHES = 500;

// MHCT logs a few areas under their own names, but they share a page here.
const DROP_LOCATION_ALIASES: Record<string, string> = {
  'Twisted Garden': 'Living Garden',
  'Cursed City': 'Lost City',
  'Sand Crypts': 'Sand Dunes',
};

let locationLootCache: Map<string, LocationLootRow[]> | null = null;

/**
 * Everything MHCT has seen drop at a location, best rate first. Each item is
 * listed with the mouse most likely to drop it there and that mouse's drop
 * chance, since a rate averaged across every mouse at the location hides that
 * one mouse always drops it.
 */
export function getLocationLoot(locationName: string): LocationLootRow[] {
  if (!locationLootCache) {
    const pooled = new Map<string, Map<number, ItemDropRow>>();
    for (const [id, { rows }] of Object.entries(getAllItemDrops())) {
      const itemId = Number(id);
      for (const row of rows) {
        if (row.catches < MIN_LOCATION_LOOT_CATCHES) continue;
        const location = DROP_LOCATION_ALIASES[row.location] ?? row.location;
        const byItem = pooled.get(location) ?? new Map();
        pooled.set(location, byItem);
        const current = byItem.get(itemId);
        if (
          !current ||
          row.drop_likelihood > current.drop_likelihood ||
          (row.drop_likelihood === current.drop_likelihood && row.catches > current.catches)
        ) {
          byItem.set(itemId, row);
        }
      }
    }

    const itemsById = new Map(getAllGameItems().map((item) => [item.id, item]));
    locationLootCache = new Map();
    for (const [location, byItem] of pooled) {
      const rows: LocationLootRow[] = [];
      for (const [id, row] of byItem) {
        const item = itemsById.get(id);
        if (!item) continue;
        rows.push({
          id,
          slug: itemSlug(item.type),
          name: item.name,
          rate: row.drop_likelihood,
          mouse_name: row.mouse_name,
          mouse_slug: mouseSlugForId(row.mouse_id),
          catches: row.catches,
          min: row.min,
          max: row.max,
        });
      }
      rows.sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name));
      locationLootCache.set(location.toLowerCase(), rows);
    }
  }
  return locationLootCache.get(locationName.toLowerCase()) ?? [];
}

/**
 * Items the game associates with an environment. The `environment` field is
 * only set on a handful of items (mostly map pieces); the location tags on
 * cheese, potions, and gear carry the rest.
 */
export function getItemsForEnvironment(environmentId: string): GameItem[] {
  return getAllGameItems().filter(
    (item) => (item.environment ?? []).includes(environmentId) || (item.tags ?? []).includes(environmentId),
  );
}

let attractionCache: Record<string, AttractionRow[]> | null = null;

/** Where a mouse is attracted and how often, best rate first (from MHCT and MH-Tools). */
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
