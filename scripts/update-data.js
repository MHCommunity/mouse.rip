import fs from 'node:fs';
import path from 'node:path';

import userscriptsData from '../src/data/userscripts.json';

/* eslint-disable no-console */
const updateUserScripts = async () => {
  console.log(`Updating ${userscriptsData.length} userscripts...`);

  const userscripts = userscriptsData;

  for (const script of userscripts) {
    if (! script.url.includes('https://greasyfork.org/en/scripts/')) {
      return;
    }

    const scriptId = script.url.replace('https://greasyfork.org/en/scripts/', '');
    const apiUrl = `https://api.greasyfork.org/en/scripts/${scriptId}.json`;

    console.log(`Updating script ID ${scriptId}...`);
    const scriptData = await fetch(apiUrl);
    if (! scriptData.ok) {
      console.error(`Failed to fetch data for script ID ${script.id}`);
      return;
    }

    const scriptJson = await scriptData.json();
    if (! scriptJson) {
      console.error(`Failed to parse JSON for script ID ${script.id}`);
      return;
    }

    const updateDataUrl = `https://greasyfork.org/en/scripts/${scriptId}/stats.json`;
    const updateData = await fetch(updateDataUrl);
    if (! updateData.ok) {
      console.error(`Failed to fetch update data for script ID ${script.id}`);
      return;
    }

    const updateJson = await updateData.json();
    if (! updateJson) {
      console.error(`Failed to parse update JSON for script ID ${script.id}`);
      return;
    }

    let updateDates = Object.keys(updateJson);
    const last7Days = updateDates.slice(-7);
    const totalUpdateChecks = last7Days.reduce((sum, date) => {
      const dayData = updateJson[date];
      return sum + (dayData.update_checks || 0);
    }, 0);

    const avg = totalUpdateChecks / last7Days.length;

    // Adjustment factor to account for users who check weekly.
    const adjustmentFactor = 1.87;
    const estimatedActiveUsers = Math.round(avg * adjustmentFactor);

    updateDates = Object.keys(updateJson);
    const last3Months = updateDates.slice(-90);
    const installsLast3Months = last3Months.reduce((sum, date) => {
      const dayData = updateJson[date];
      return sum + (dayData.installs || 0);
    }, 0);

    updateDates = Object.keys(updateJson);
    const lastMonth = updateDates.slice(-30);
    const installsLastMonth = lastMonth.reduce((sum, date) => {
      const dayData = updateJson[date];
      return sum + (dayData.installs || 0);
    }, 0);

    // Find the script in the userscripts array
    const scriptIndex = userscripts.findIndex((s) => s.id === script.id);
    if (scriptIndex === -1) {
      console.error(`Script ID ${script.id} not found in userscripts array`);
      return;
    }

    const scriptAuthor = scriptJson.users.map((author) => {
      return {
        name: author.name,
        url: author.url,
      };
    });

    userscripts[scriptIndex] = {
      ...userscripts[scriptIndex],
      data: {
        name: scriptJson.name,
        description: scriptJson.description,
        installs: scriptJson.total_installs,
        active_users: estimatedActiveUsers,
        installs_last_3_months: installsLast3Months,
        installs_last_month: installsLastMonth,
        created_at: scriptJson.created_at,
        updated_at: scriptJson.code_updated_at,
        version: scriptJson.version,
        author: scriptAuthor,
      }
    };

    const filePath = path.join(__dirname, '../src/data/userscripts.json');
    fs.writeFileSync(filePath, JSON.stringify(userscripts, null, 2), 'utf-8');
  }

  console.log(`Updated ${userscripts.length} userscripts.`);
};

const updateDataFiles = async () => {
  const files = [
    'environments',
    'environments-events',
    'mice',
    'mice-groups',
    'items',
    'mhct-convertibles',
    'mhct-reverse-convertibles',
    'mhct-reverse-mapper',
    'mice-attraction-rates',
  ];

  // For each file, fetch it from api.mouse.rip and save it to the data folder
  for (const file of files) {
    const apiUrl = `https://api.mouse.rip/${file}`;

    const data = await fetch(apiUrl);
    if (! data.ok) {
      console.error(`Failed to fetch data for ${file}`);
      return;
    }

    const json = await data.json();
    if (! json) {
      console.error(`Failed to parse JSON for ${file}`);
      return;
    }

    console.log(`Updating ${file}...`);

    const filePath = path.join(__dirname, `../src/data/generated/${file}.json`);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
  }
};

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
    console.log(`Fetching images for ${mouse.type}...`);
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
    console.log(`Fetching images for ${item.type}...`);
    if (! item.images.large.length) {
      item.images.large = item.images.thumbnail;
    }
    const largePath = path.join(__dirname, `../public/images/items/large/${item.type.replaceAll(/_/g, '-')}.png`);
    if (! fs.existsSync(largePath)) {
      const imageData = await fetch(item.images.large);
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
  }
};

/* eslint-enable no-console */

if (false) { // eslint-disable-line no-constant-condition
  updateItemImages();
  updateMiceImages();
}

updateDataFiles();
updateUserScripts();
