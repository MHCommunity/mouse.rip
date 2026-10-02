import fs from 'node:fs';
import path from 'node:path';

const fetchImage = async (urls, fullPath) => {
  if (fs.existsSync(fullPath)) {
    return true;
  }

  for (const url of urls.filter(Boolean)) {
    const imageData = await fetch(url);
    if (!imageData.ok) {
      console.error(`Failed to fetch image for ${url}: ${imageData.statusText}`);
      continue;
    }

    const imageBuffer = Buffer.from(await imageData.arrayBuffer());
    if (!imageBuffer || imageBuffer.length === 0) continue;

    await fs.promises.writeFile(fullPath, imageBuffer);
    return true;
  }

  return false;
};

const updateItemImages = async () => {
  const itemLargeDir = path.join(__dirname, '../static-mouse-rip/images/items/large');
  const itemThumbnailDir = path.join(__dirname, '../static-mouse-rip/images/items/thumbnail');
  const itemTrapDir = path.join(__dirname, '../static-mouse-rip/images/items/trap');

  if (!fs.existsSync(itemLargeDir)) {
    fs.mkdirSync(itemLargeDir, { recursive: true });
  }

  if (!fs.existsSync(itemThumbnailDir)) {
    fs.mkdirSync(itemThumbnailDir, { recursive: true });
  }

  if (!fs.existsSync(itemTrapDir)) {
    fs.mkdirSync(itemTrapDir, { recursive: true });
  }

  const items = await fetch('https://api.mouse.rip/items').then((res) => res.json());
  if (!items) {
    return;
  }

  for (const item of items) {
    console.log(`Fetching images for ${item.type}...`);
    const slug = item.type.replaceAll(/_/g, '-');
    await fetchImage(
      [item.images.upscaled, item.images.best, item.images.large, item.images.thumbnail],
      path.join(itemLargeDir, `${slug}.png`),
    );
    await fetchImage(
      [item.images.thumbnail, item.images.best, item.images.large],
      path.join(itemThumbnailDir, `${slug}.png`),
    );

    if (item.images.trap) {
      await fetchImage([item.images.trap], path.join(itemTrapDir, `${slug}.png`));
    }
  }
};

updateItemImages();
