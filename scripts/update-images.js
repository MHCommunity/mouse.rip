import fs from 'node:fs';
import path from 'node:path';

const fetchImage = async (url, fullPath) => {
  if (fs.existsSync(fullPath)) {
    return;
  }

  const imageData = await fetch(url);
  if (! imageData.ok || imageData.redirected) {
    console.error(`Failed to fetch image for ${url}: ${imageData.statusText}`); // eslint-disable-line no-console
    return;
  }

  const imageBuffer = Buffer.from(await imageData.arrayBuffer());
  if (! imageBuffer || imageBuffer.length === 0) {
    return;
  }

  fs.writeFile(fullPath, imageBuffer, (err) => {
    if (err) {
      console.error(`Failed to write image to ${fullPath}: ${err.message}`); // eslint-disable-line no-console
    }
  });
};

const updateMiceImages = async () => {
  const mice = await fetch('https://api.mouse.rip/mice').then((res) => res.json());
  if (! mice) {
    return;
  }

  for (const mouse of mice) {
    console.log(`Fetching images for ${mouse.type}...`); // eslint-disable-line no-console
    await fetchImage(mouse.images.large, path.join(__dirname, `../public/images/mice/large/${mouse.type.replaceAll(/_/g, '-')}.png`));
    await fetchImage(mouse.images.thumbnail, path.join(__dirname, `../public/images/mice/thumbnail/${mouse.type.replaceAll(/_/g, '-')}.png`));
  }
};

const updateItemImages = async () => {
  const items = await fetch('https://api.mouse.rip/items').then((res) => res.json());
  if (! items) {
    return;
  }

  const itemsToSkip = new Set([
    'arch_duke_achievement',
    'bucket_o_cannon_parts_crafting_item',
    'charm_level_2_trinket_slot',
    'charm_level_3_trinket_slot',
    'expired_cheese',
    'fools_claw_shot_crate_convertible',
    'halloween_2020_journal_theme_collectible',
    'tournament_reaper_skin',
  ]);

  for (const item of items) {
    if (itemsToSkip.has(item.type)) {
      console.log(`Skipping item ${item.type}...`); // eslint-disable-line no-console
      continue;
    }

    console.log(`Fetching images for ${item.type}...`); // eslint-disable-line no-console
    await fetchImage(
      item.images.upscaled || item.images.best || item.images.large,
      path.join(__dirname, `../public/images/items/large/${item.type.replaceAll(/_/g, '-')}.png`)
    );

    await fetchImage(
      item.images.thumbnail,
      path.join(__dirname, `../public/images/items/thumbnail/${item.type.replaceAll(/_/g, '-')}.png`)
    );

    if (item.images.trap) {
      await fetchImage(
        item.images.trap,
        path.join(__dirname, `../public/images/items/trap/${item.type.replaceAll(/_/g, '-')}.png`)
      );
    }
  }
};

updateMiceImages();
updateItemImages();
