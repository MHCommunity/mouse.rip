import environments from '@/data/generated/environments.json';
import titles from '@/data/generated/titles.json';
import relicHunterHints from '@/data/generated/relic-hunter-hints.json';
import resources from '@/data/resources.json';
import locations from '@/data/locations.json';
import trapEffects from '@/data/trap-effects.json';
import userscripts from '@/data/userscripts.json';

import { Environment, LocationRegion, Resource, RelicHunterHints, Title, TrapEffectLocation } from '@/types';

export function getResources(): Resource[] {
  return [...resources, ...userscripts];
}

export function getLocation(id: string): Environment | undefined {
  for (const region of locations as LocationRegion[]) {
    const found = region.locations.find((location) => location.id === id);
    if (found) {
      const foundEnvironment = environments.find((env: Environment) => env.name === found.name);
      if (!foundEnvironment) return found;

      return {
        ...foundEnvironment,
        id: found.id,
        environmentId: foundEnvironment.id,
      };
    }
  }

  return undefined;
}

export function getLocations(): LocationRegion[] {
  return locations;
}

export function getResource(id: string): Resource | undefined {
  return getResources().find((item) => item.id.toString() === id);
}

export function getResourcesByCategory(category: string): Resource[] {
  return getResources().filter((item) => item.category === 'all' || item.category === category);
}

const GUIDE_PATH_PREFIX = '/guides/';

export function getOnSiteGuides(): Resource[] {
  return getResources().filter((item) => item.category === 'guide' && item.url.startsWith(GUIDE_PATH_PREFIX));
}

export function getGuide(slug: string): Resource | undefined {
  return getOnSiteGuides().find((item) => item.url === `${GUIDE_PATH_PREFIX}${slug}`);
}

export function getResourcesForLocation(location: string): Resource[] {
  return getResources().filter((item) => item.locations?.includes('all') || item.locations?.includes(location));
}

export function getPopularResources(): Resource[] {
  return getResources().filter((item) => item.highlight);
}

export function getTitles(): Title[] {
  return [...(titles as Title[])].sort((a, b) => a.order - b.order);
}

export function getTrapEffects(): TrapEffectLocation[] {
  return trapEffects as TrapEffectLocation[];
}

export function getRelicHunterHints(): RelicHunterHints {
  return relicHunterHints as RelicHunterHints;
}

export function getEnvironments(): Environment[] {
  return environments as Environment[];
}
