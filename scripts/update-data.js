import fs from 'node:fs';
import path from 'node:path';

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
      console.error(`Failed to fetch data for ${file}`); // eslint-disable-line no-console
      return;
    }

    const json = await data.json();
    if (! json) {
      console.error(`Failed to parse JSON for ${file}`); // eslint-disable-line no-console
      return;
    }

    console.log(`Updating ${file}...`); // eslint-disable-line no-console

    const filePath = path.join(__dirname, `../src/data/generated/${file}.json`);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
  }
};

updateDataFiles();
