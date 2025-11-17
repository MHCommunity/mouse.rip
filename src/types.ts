import { z } from 'zod';

export const MouseRipItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string(),
  source: z.string().optional(),
  category: z.string(),
  locations: z.array(z.string()).optional(),
  priority: z.number().optional(),
  highlight: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  data: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    installs: z.number().optional(),
    active_users: z.number().optional(),
    installs_last_3_months: z.number().optional(),
    installs_last_month: z.number().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    version: z.string().optional(),
  }).optional(),
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
  name: z.string().optional(),
  article: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});
export type Environment = z.infer<typeof EnvironmentSchema>;

export const MouseSchema = z.object({
  id: z.number(),
  name: z.string(),
  abbreviated_name: z.string().optional(),
  description: z.string(),
  points: z.number(),
  points_formatted: z.string(),
  gold: z.number(),
  gold_formatted: z.string(),
  group: z.string(),
  subgroup: z.string().optional(),
  images: z.object({
    thumbnail: z.string().optional(),
    silhouette_thumbnail: z.string().optional(),
    small: z.string().optional(),
    medium: z.string().optional(),
    silhouette_medium: z.string().optional(),
    large: z.string().optional(),
    silhouette_large: z.string().optional(),
    square: z.string().optional(),
    is_landscape: z.boolean().optional(),
  }).optional(),
  weaknesses: z.object({
    effective: z.array(z.string()).optional(),
  }).optional(),
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
  effectivenesses: z.object({
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
  }).optional(),
});
export type Mouse = z.infer<typeof MouseSchema>;

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
