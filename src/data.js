import items from './data/items.json';
import userscripts from './data/userscripts.json';
import locations from './data/locations.json';

function getItems() {
  return [...items, ...userscripts];
}

async function getLocation(id) {
  return (await getLocations()).find((location) =>
    location.locations.some((innerLocation) => innerLocation.id === id)
  );
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

export { getItem, getItems, getItemsByCategory, getItemsByLocation, getItemsWithoutUserscripts, getLocation, getLocations };
