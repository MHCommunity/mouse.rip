import environments from './data/generated/environments.json';
import items from './data/items.json';
import locations from './data/locations.json';
import userscripts from './data/userscripts.json';

import { MouseRipItem, Environment, LocationRegion } from '@/types';

export function getItems(): MouseRipItem[] {
  return [...items, ...userscripts];
}

export function getLocation(id: string): Environment | undefined {
  let environment = { id };
  for (const region of locations as LocationRegion[]) {
    const found = region.locations.find((location: { id: { toString: () => string; }; }) => location.id.toString() === id);
    if (found) {
      const foundEnvironment = environments.find((env: Environment) => env.name === found.name) || found;
      environment = { ...foundEnvironment, id: found.id.toString() };
      return environment;
    }
  }

  return environment;
}

export function getLocations(): LocationRegion[] {
  return locations;
}

export function getItem(id: string): MouseRipItem | undefined {
  return getItems().find((item) => item.id.toString() === id);
}

export function getItemsByCategory(category: string): MouseRipItem[] {
  return getItems().filter((item) => item.category === 'all' || item.category === category);
}

export function getItemsByLocation(location: string): MouseRipItem[] {
  return getItems().filter((item) => item.locations?.includes('all') || item.locations?.includes(location));
}

export function getItemsWithoutUserscripts(): MouseRipItem[] {
  return getItems().filter((item) => item.category !== 'userscript');
}

export function getPopularItems(): MouseRipItem[] {
  return getItems().filter((item) => item.highlight);
}
