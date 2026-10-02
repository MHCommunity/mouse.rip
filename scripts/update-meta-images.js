import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dir, '..');
const output = path.join(root, 'static-mouse-rip', 'images');

async function readJson(file) {
  return JSON.parse(await fs.promises.readFile(path.join(root, file), 'utf8'));
}

async function fetchImage(url, destination) {
  if (!url || fs.existsSync(destination)) return;
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    return;
  }
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > 0) await fs.promises.writeFile(destination, data);
}

function slug(value) {
  return value.replaceAll('_', '-');
}

const [groups, titles, environments, regions] = await Promise.all([
  readJson('src/data/generated/mice-groups.json'),
  readJson('src/data/generated/titles.json'),
  readJson('src/data/generated/environments.json'),
  readJson('src/data/locations.json'),
]);

for (const group of groups) {
  await fetchImage(group.banner, path.join(output, 'mice', 'groups', `${slug(group.id)}.jpg`));
}

for (const title of titles) {
  await fetchImage(title.icon, path.join(output, 'titles', `${slug(title.id)}.png`));
}

const environmentByName = new Map(environments.map((environment) => [environment.name, environment]));
for (const environment of environments) {
  const environmentSlug = slug(environment.id);
  await fetchImage(environment.image, path.join(output, 'locations', `${environmentSlug}.png`));
  await fetchImage(environment.headerImage, path.join(output, 'locations', 'headers', `${environmentSlug}.jpg`));
}

// Public location slugs sometimes differ from MouseHunt's environment IDs.
// Copy those aliases so pages and live API responses can both use predictable URLs.
for (const region of regions) {
  for (const location of region.locations) {
    const environment = environmentByName.get(location.name);
    if (!environment) continue;
    const sourceSlug = slug(environment.id);
    const publicSlug = slug(location.id);
    if (sourceSlug === publicSlug) continue;

    for (const [subdirectory, extension] of [
      ['', 'png'],
      ['headers', 'jpg'],
    ]) {
      const source = path.join(output, 'locations', subdirectory, `${sourceSlug}.${extension}`);
      const destination = path.join(output, 'locations', subdirectory, `${publicSlug}.${extension}`);
      if (fs.existsSync(source) && !fs.existsSync(destination)) {
        await fs.promises.copyFile(source, destination);
      }
    }
  }
}
