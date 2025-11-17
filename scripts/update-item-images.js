import fs from 'node:fs';
import path from 'node:path';

const fetchImage = async (url, fullPath) => {
  if (fs.existsSync(fullPath)) {
    return;
  }

  const imageData = await fetch(url);
  if (! imageData.ok || imageData.redirected) {
    console.error(`Failed to fetch image for ${url}: ${imageData.statusText}`);
    return;
  }

  const imageBuffer = Buffer.from(await imageData.arrayBuffer());
  if (! imageBuffer || imageBuffer.length === 0) {
    return;
  }

  fs.writeFile(fullPath, imageBuffer, (err) => {
    if (err) {
      console.error(`Failed to write image to ${fullPath}: ${err.message}`);
    }
  });
};

const updateItemImages = async () => {
  const itemLargeDir = path.join(__dirname, '../static-mouse-rip/images/items/large');
  const itemThumbnailDir = path.join(__dirname, '../static-mouse-rip/images/items/thumbnail');
  const itemTrapDir = path.join(__dirname, '../static-mouse-rip/images/items/trap');

  if (! fs.existsSync(itemLargeDir)) {
    fs.mkdirSync(itemLargeDir, { recursive: true });
  }

  if (! fs.existsSync(itemThumbnailDir)) {
    fs.mkdirSync(itemThumbnailDir, { recursive: true });
  }

  if (! fs.existsSync(itemTrapDir)) {
    fs.mkdirSync(itemTrapDir, { recursive: true });
  }

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
    if (! itemsToSkip.has(item.type)) {
      console.log(`Fetching images for ${item.type}...`);
      await fetchImage(item.images.upscaled || item.images.best || item.images.large, path.join(itemLargeDir, `${item.type.replaceAll(/_/g, '-')}.png`));
      await fetchImage(item.images.thumbnail, path.join(itemThumbnailDir, `${item.type.replaceAll(/_/g, '-')}.png`));

      if (item.images.trap) {
        await fetchImage(item.images.trap, path.join(itemTrapDir, `/${item.type.replaceAll(/_/g, '-')}.png`));
      }
    }
  }
};

updateItemImages();
