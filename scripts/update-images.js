import fs from 'node:fs';
import path from 'node:path';

// Downloads the images the site serves into static-mouse-rip/images, from the
// data `update:data` already saved. Images that are already there are skipped.

const root = path.join(import.meta.dir, '..');
const output = path.join(root, 'static-mouse-rip', 'images');

async function readJson(file) {
  return JSON.parse(await fs.promises.readFile(path.join(root, file), 'utf8'));
}

const FETCH_TIMEOUT_MS = 30_000;

/** Save the first of `urls` that downloads. Returns whether the image is there. */
async function fetchImage(urls, destination) {
  if (!destination) return false;
  if (fs.existsSync(destination)) return true;

  for (const url of [urls].flat().filter(Boolean)) {
    let data;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        continue;
      }
      data = Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error(`Failed to fetch ${url}: ${error.message}`);
      continue;
    }
    if (data.length === 0) continue;

    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.writeFile(destination, data);
    return true;
  }

  return false;
}

function slug(value) {
  return String(value).replaceAll('_', '-');
}

/**
 * Where to save an image named after an API id, or null when the id would
 * not make a safe file name (so a bad id can't write outside `output`).
 */
function imagePath(id, ...segments) {
  const name = slug(id);
  if (!/^[a-z0-9-]+$/.test(name)) {
    console.warn(`Skipping image with unexpected id: ${id}`);
    return null;
  }
  const extension = segments.pop();
  return path.join(output, ...segments, `${name}.${extension}`);
}

async function updateMiceImages(mice) {
  for (const mouse of mice) {
    for (const size of ['large', 'square', 'thumbnail']) {
      await fetchImage(mouse.images?.[size], imagePath(mouse.type, 'mice', size, 'png'));
    }
  }
}

async function updateItemImages(items) {
  for (const item of items) {
    const images = item.images ?? {};
    await fetchImage(
      [images.upscaled, images.best, images.large, images.thumbnail],
      imagePath(item.type, 'items', 'large', 'png'),
    );
    await fetchImage([images.thumbnail, images.best, images.large], imagePath(item.type, 'items', 'thumbnail', 'png'));
    await fetchImage(images.trap, imagePath(item.type, 'items', 'trap', 'png'));
  }
}

async function updateMetaImages(groups, titles, environments, regions) {
  for (const group of groups) {
    await fetchImage(group.banner, imagePath(group.id, 'mice', 'groups', 'jpg'));
  }

  for (const title of titles) {
    await fetchImage(title.icon, imagePath(title.id, 'titles', 'png'));
  }

  for (const environment of environments) {
    await fetchImage(environment.image, imagePath(environment.id, 'locations', 'png'));
    await fetchImage(environment.headerImage, imagePath(environment.id, 'locations', 'headers', 'jpg'));
  }

  // Public location slugs sometimes differ from MouseHunt's environment IDs.
  // Copy those aliases so pages and live API responses can both use predictable URLs.
  const environmentByName = new Map(environments.map((environment) => [environment.name, environment]));
  for (const region of regions) {
    for (const location of region.locations) {
      const environment = environmentByName.get(location.name);
      if (!environment) continue;
      if (slug(environment.id) === slug(location.id)) continue;

      for (const subdirectory of [[], ['headers']]) {
        const extension = subdirectory.length ? 'jpg' : 'png';
        const source = imagePath(environment.id, 'locations', ...subdirectory, extension);
        const destination = imagePath(location.id, 'locations', ...subdirectory, extension);
        if (source && destination && fs.existsSync(source) && !fs.existsSync(destination)) {
          await fs.promises.copyFile(source, destination);
        }
      }
    }
  }
}

const [mice, items, groups, titles, environments, regions] = await Promise.all([
  readJson('src/data/generated/mice.json'),
  readJson('src/data/generated/game-items.json'),
  readJson('src/data/generated/mice-groups.json'),
  readJson('src/data/generated/titles.json'),
  readJson('src/data/generated/environments.json'),
  readJson('src/data/locations.json'),
]);

await Promise.all([
  updateMiceImages(mice),
  updateItemImages(items),
  updateMetaImages(groups, titles, environments, regions),
]);
