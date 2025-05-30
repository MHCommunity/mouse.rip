import fs from 'node:fs';
import path from 'node:path';

const updateMiceImages = async () => {
  const miceData = await fetch('https://api.mouse.rip/mice');
  if (! miceData.ok) {
    return;
  }

  const mice = await miceData.json();
  if (! mice) {
    return;
  }

  for (const mouse of mice) {
    console.log(`Fetching images for ${mouse.type}...`); // eslint-disable-line no-console
    const largePath = path.join(__dirname, `../public/images/mice/large/${mouse.type.replaceAll(/_/g, '-')}.png`);
    if (! fs.existsSync(largePath)) {
      const imageData = await fetch(mouse.images.large);
      if (imageData.ok) {
        const imageBuffer = Buffer.from(await imageData.arrayBuffer());
        fs.writeFileSync(largePath, imageBuffer);
      }
    }

    const thumbPath = path.join(__dirname, `../public/images/mice/thumbnail/${mouse.type.replaceAll(/_/g, '-')}.png`);
    if (! fs.existsSync(thumbPath)) {
      const thumbnailData = await fetch(mouse.images.thumbnail);
      if (thumbnailData.ok) {
        const thumbnailBuffer = Buffer.from(await thumbnailData.arrayBuffer());
        fs.writeFileSync(thumbPath, thumbnailBuffer);
      }
    }
  }
};

const updateItemImages = async () => {
  const itemsData = await fetch('https://api.mouse.rip/items');
  if (! itemsData.ok) {
    return;
  }

  const items = await itemsData.json();
  if (! items) {
    return;
  }

  for (const item of items) {
    console.log(`Fetching images for ${item.type}...`); // eslint-disable-line no-console
    if (! item.images.large.length) {
      item.images.large = item.images.thumbnail;
    }
    const largePath = path.join(__dirname, `../public/images/items/large/${item.type.replaceAll(/_/g, '-')}.png`);
    if (! fs.existsSync(largePath)) {
      const imageData = await fetch(item.images.upscaled || item.images.large);
      if (imageData.ok) {
        const imageBuffer = Buffer.from(await imageData.arrayBuffer());
        fs.writeFileSync(largePath, imageBuffer);
      }
    }

    const thumbPath = path.join(__dirname, `../public/images/items/thumbnail/${item.type.replaceAll(/_/g, '-')}.png`);
    if (! fs.existsSync(thumbPath)) {
      const thumbnailData = await fetch(item.images.thumbnail);
      if (thumbnailData.ok) {
        const thumbnailBuffer = Buffer.from(await thumbnailData.arrayBuffer());
        fs.writeFileSync(thumbPath, thumbnailBuffer);
      }
    }

    if (item.images.trap) {
      const trapPath = path.join(__dirname, `../public/images/items/trap/${item.type.replaceAll(/_/g, '-')}.png`);
      if (! fs.existsSync(trapPath)) {
        const trapData = await fetch(item.images.trap);
        if (trapData.ok) {
          const trapBuffer = Buffer.from(await trapData.arrayBuffer());
          fs.writeFileSync(trapPath, trapBuffer);
        }
      }
    }
  }
};

updateItemImages();
updateMiceImages();
