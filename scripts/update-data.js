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

  const itemsToSkip = new Set([
    'arch_duke_achievement',
    'bucket_o_cannon_parts_crafting_item',
    'charm_level_2_trinket_slot',
    'charm_level_3_trinket_slot',
    'expired_cheese',
    'fools_claw_shot_crate_convertible',
    'fools_claw_shot_crate_convertible',
    'halloween_2020_journal_theme_collectible',
    'tournament_reaper_skin',
  ]);

  // For each file, fetch it from api.mouse.rip and save it to the data folder
  for (const file of files) {
    let json = await fetch(`https://api.mouse.rip/${file}`).then((res) => res.json());
    if (! json) {
      console.error(`Failed to fetch data for ${file}`); // eslint-disable-line no-console
      return;
    }

    console.log(`Updating ${file}...`); // eslint-disable-line no-console

    if ('items' === file) {
      json = json.filter((item) => ! itemsToSkip.has(item.type));
    }

    const filePath = path.join(__dirname, `../src/data/generated/${file}.json`);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
  }
};

updateDataFiles();
