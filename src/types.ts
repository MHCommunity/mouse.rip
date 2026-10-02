import { z } from 'zod';

export const MouseRipItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string(),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  category: z.string(),
  locations: z.array(z.string()).optional(),
  priority: z.number().optional(),
  highlight: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});
export type MouseRipItem = z.infer<typeof MouseRipItemSchema>;

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Location = z.infer<typeof LocationSchema>;

export const LocationRegionSchema = z.object({
  id: z.string(),
  name: z.string(),
  locations: z.array(LocationSchema),
});
export type LocationRegion = z.infer<typeof LocationRegionSchema>;

export const EnvironmentSchema = z.object({
  id: z.string(),
  /** Upstream environment ID when `id` is the site's public route slug. */
  environmentId: z.string().optional(),
  name: z.string().optional(),
  article: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  headerImage: z.string().optional(),
  region: z.string().optional(),
  title: z.string().optional(),
  order: z.number().optional(),
});
export type Environment = z.infer<typeof EnvironmentSchema>;

export interface Title {
  id: string;
  order: number;
  icon: string;
  name: string;
  name_female?: string;
  name_male?: string;
}

export interface TrapEffect {
  name: string;
  effect: string;
}

export interface TrapEffectLocation {
  region: string;
  location: string;
  effects: TrapEffect[];
}

export type RelicHunterHints = Record<string, string[]>;

export const MouseSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  abbreviated_name: z.string().optional(),
  description: z.string(),
  points: z.number(),
  points_formatted: z.string(),
  gold: z.number(),
  gold_formatted: z.string(),
  group: z.string(),
  subgroup: z.string().optional(),
  images: z
    .object({
      thumbnail: z.string().optional(),
      silhouette_thumbnail: z.string().optional(),
      small: z.string().optional(),
      medium: z.string().optional(),
      silhouette_medium: z.string().optional(),
      large: z.string().optional(),
      silhouette_large: z.string().optional(),
      square: z.string().optional(),
      is_landscape: z.boolean().optional(),
    })
    .optional(),
  weaknesses: z
    .object({
      effective: z.array(z.string()).optional(),
    })
    .optional(),
  minlucks: z.object({
    arcane: z.number().optional(),
    draconic: z.number().optional(),
    forgotten: z.number().optional(),
    hydro: z.number().optional(),
    physical: z.number().optional(),
    shadow: z.number().optional(),
    tactical: z.number().optional(),
    law: z.number().optional(),
    rift: z.number().optional(),
  }),
  wisdom: z.number(),
  effectivenesses: z
    .object({
      power: z.number().optional(),
      arcane: z.number().optional(),
      draconic: z.number().optional(),
      forgotten: z.number().optional(),
      hydro: z.number().optional(),
      physical: z.number().optional(),
      shadow: z.number().optional(),
      tactical: z.number().optional(),
      law: z.number().optional(),
      rift: z.number().optional(),
    })
    .optional(),
});
export type Mouse = z.infer<typeof MouseSchema>;

/** Slim subset of Mouse shipped to the client (site search, minlucks table). */
export type SlimMouse = Pick<Mouse, 'id' | 'type' | 'name' | 'abbreviated_name' | 'group' | 'subgroup' | 'minlucks'>;

export interface GeneratedItem {
  id: number;
  type: string;
  name: string;
  group: string;
  classification: string;
  description: string;
  is_tradable: boolean;
  is_givable: boolean;
  is_limited_edition?: boolean;
  tags?: string[];
  images: {
    trap?: boolean;
    large?: boolean;
  };
}

export interface GameItemStats {
  power_type?: string;
  has_power?: boolean;
  power?: number;
  power_formatted?: string;
  has_power_bonus?: boolean;
  power_bonus?: number;
  power_bonus_formatted?: string;
  has_attraction_bonus?: boolean;
  attraction_bonus?: number;
  attraction_bonus_formatted?: string;
  has_luck?: boolean;
  luck?: number;
  luck_formatted?: string;
  has_cheese_effect?: boolean;
  cheese_effect?: string;
  has_skins?: boolean;
  skins?: string[];
  has_min_title?: boolean;
  min_title?: string;
  has_min_points?: boolean;
  min_points?: number;
  min_points_formatted?: string;
}

export interface GameItemImages {
  thumbnail?: string;
  large?: string;
  thumbnail_large?: string;
  gray?: string;
  transparent?: string;
  transparent_large?: string;
  best?: string;
  trap?: string;
}

export interface GameItem {
  id: number;
  type: string;
  name: string;
  description?: string;
  obtain_hint?: string;
  classification: string;
  tags?: string[];
  environment?: string[];
  images?: GameItemImages;
  is_limited_edition?: boolean;
  is_givable?: boolean;
  is_tradable?: boolean;
  is_convertible?: boolean;
  is_smashable?: boolean;
  is_potion?: boolean;
  is_skin?: boolean;
  is_charm?: boolean;
  is_quantity_limited?: boolean;
  is_airship_part?: boolean;
  quantity_limit?: number;
  has_stats?: GameItemStats | false;
}

export interface MiceGroup {
  id: string;
  name: string;
  display_order: number;
  description_short: string;
  description: string;
  banner: string;
  mouse_ids: number[];
}

export interface GeneratedMouse {
  id: number;
  type: string;
  name: string;
  description: string;
  points: number;
  gold: number;
  wisdom: number;
  group: string;
  subgroup?: string;
  images: {
    large: string;
    is_landscape?: boolean;
  };
  weaknesses?: {
    effective?: string[];
  };
  minlucks?: Record<string, number>;
}

export interface MiceRegion {
  id: string;
  name: string;
  mouse_ids: number[];
}

export interface EnvironmentEvent {
  id: string;
  name: string;
}

export interface AttractionRate {
  [environmentId: string]: Record<string, unknown>;
}

export interface MapData {
  type: string;
  maps: Array<{
    map: string;
    rate: number;
  }>;
}

/** A scroll case, the map it opens into, and the treasure chests that map awards. */
export interface MapRelation {
  scrollCase: { id: number; type: string; name: string };
  map: { name: string; mhctId: number };
  chests: { id: number; type: string; name: string; rare: boolean }[];
}

/** A convertible an item can come out of, linked when we have a page for it. */
export interface FoundInConvertible {
  id?: number;
  name: string;
  slug?: string;
}

/**
 * The MHCT-derived tables baked in by scripts/update-data.js. These used to be
 * fetched from the client on every page view; they're prerendered now, so the
 * shapes mirror what api.mouse.rip returned.
 */

/** One reward row from opening a convertible. `chance` is a percent, e.g. "5.56". */
export interface ConvertibleRow {
  id: number;
  name: string;
  min: number;
  max: number;
  chance: string;
  /** Filled in at build time when the reward has an item page of its own. */
  slug?: string;
}

/** One location/cheese combination that drops a given item. */
export interface ItemDropRow {
  location: string;
  stage: string | null;
  cheese: string;
  drop_pct: string | number;
  total_hunts?: number;
  min_amt: number;
  max_amt: number;
}

/** The 50 best drop rows for an item, plus how many MHCT actually recorded. */
export interface ItemDrops {
  rows: ItemDropRow[];
  total: number;
}

/** Where a mouse is attracted, and how often. `rate` is in hundredths of a percent. */
export interface AttractionRow {
  location: string;
  stage: string | null;
  cheese: string;
  rate: number;
  total_hunts: number;
}

/** A treasure map a mouse can appear on. */
export interface MouseMapRow {
  map: string;
  rate: number;
  seen_maps: number;
  total_maps: number;
}
