import items from './data/items.json';
import userscripts from './data/userscripts.json';
import locations from './data/locations.json';
import environments from './data/generated/environments.json';

function getItems() {
  return [...items, ...userscripts];
}

function getLocation(id) {
  for (const region of locations) {
    const found = region.locations.find((location) => location.id.toString() === id);
    if (found) {
      return environments.find((env) => env.name === found.name) || found;
    }
  }

  return undefined;
}

function getLocations() {
  return locations;
}

function getItem(id) {
  return (getItems()).find((item) => item.id.toString() === id);
}

function getItemsByCategory(category) {
  return (getItems()).filter((item) => item.category === 'all' || item.category === category);
}

function getItemsByLocation(location) {
  return (getItems()).filter((item) => item.locations?.includes('all') || item.locations?.includes(location));
}

function getItemsWithoutUserscripts() {
  return (getItems()).filter((item) => item.category !== 'userscript');
}

function getPopularItems() {
  return (getItems()).filter((item) => item.highlight);
}

export { getItem, getItems, getItemsByCategory, getItemsByLocation, getItemsWithoutUserscripts, getLocation, getLocations, getPopularItems };
