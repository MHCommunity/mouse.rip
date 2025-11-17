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

const updateMiceImages = async () => {
  const largeDir = path.join(__dirname, '../static-mouse-rip/images/mice/large');
  const squareDir = path.join(__dirname, '../static-mouse-rip/images/mice/square');
  const thumbnailDir = path.join(__dirname, '../static-mouse-rip/images/mice/thumbnail');

  if (! fs.existsSync(largeDir)) {
    fs.mkdirSync(largeDir, { recursive: true });
  }
  if (! fs.existsSync(squareDir)) {
    fs.mkdirSync(squareDir, { recursive: true });
  }
  if (! fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir, { recursive: true });
  }

  const mice = await fetch('https://api.mouse.rip/mice').then((res) => res.json());
  if (! mice) {
    return;
  }

  for (const mouse of mice) {
    console.log(`Fetching images for ${mouse.type}...`);
    await fetchImage(mouse.images.large, path.join(largeDir, `${mouse.type.replaceAll(/_/g, '-')}.png`));
    await fetchImage(mouse.images.square, path.join(squareDir, `${mouse.type.replaceAll(/_/g, '-')}.png`));
    await fetchImage(mouse.images.thumbnail, path.join(thumbnailDir, `${mouse.type.replaceAll(/_/g, '-')}.png`));
  }
};

updateMiceImages();
