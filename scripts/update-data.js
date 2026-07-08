import fs from 'node:fs';
import path from 'node:path';

const updateDataFiles = async () => {
  const files = [
    'environments-events',
    'environments',
    'mice',
    'mice-groups',
    'mice-regions',
    'titles',
    'relic-hunter-hints',
    'game-items',
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

  // For each file, fetch it from api.mouse.rip and save it to the data folder.
  // 'game-items' is the full game item catalog (served at /items), saved compact
  // since it is large and only read at build time.
  for (const file of files) {
    const endpoint = 'game-items' === file ? 'items' : file;
    let json = await fetch(`https://api.mouse.rip/${endpoint}`).then((res) => res.json());
    if (! json) {
      console.error(`Failed to fetch data for ${file}`);
      return;
    }

    console.log(`Updating ${file}...`);

    if ('game-items' === file) {
      json = json.filter((item) => ! itemsToSkip.has(item.type));
      const filePath = path.join(__dirname, `../src/data/generated/${file}.json`);
      fs.writeFileSync(filePath, JSON.stringify(json), 'utf-8');

      // Slim index used by site search (full file is too large to ship to the client).
      const slim = json.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        classification: item.classification,
      }));
      const slimPath = path.join(__dirname, '../src/data/generated/game-items-search.json');
      fs.writeFileSync(slimPath, JSON.stringify(slim), 'utf-8');

      // Small cheese (bait) + location name → slug lookup, used to cross-link
      // MHCT attraction/drop tables to item and location pages.
      const slugify = (value) => String(value).replaceAll('_', '-');
      const cheese = {};
      for (const item of json) {
        if (item.classification !== 'bait') continue;
        const itemSlug = slugify(item.type);
        const name = item.name.toLowerCase();
        cheese[name] = itemSlug;
        const stripped = name.replace(/\s*cheese$/, '');
        if (stripped !== name && ! cheese[stripped]) cheese[stripped] = itemSlug;
      }
      const locations = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../src/data/locations.json'), 'utf-8')
      );
      const location = {};
      for (const region of locations) {
        for (const loc of region.locations) location[loc.name.toLowerCase()] = loc.id;
      }
      const lookupPath = path.join(__dirname, '../src/data/generated/name-lookup.json');
      fs.writeFileSync(lookupPath, JSON.stringify({ cheese, location }), 'utf-8');
      continue;
    }

    const filePath = path.join(__dirname, `../src/data/generated/${file}.json`);
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');

    if ('mice' === file) {
      // Slim subset shared by site search and the minlucks table (the full file
      // is ~3MB and would otherwise ship to the client).
      const slim = json.map((mouse) => ({
        id: mouse.id,
        type: mouse.type,
        name: mouse.name,
        abbreviated_name: mouse.abbreviated_name,
        group: mouse.group,
        subgroup: mouse.subgroup,
        minlucks: mouse.minlucks,
      }));
      const slimPath = path.join(__dirname, '../src/data/generated/mice-search.json');
      fs.writeFileSync(slimPath, JSON.stringify(slim), 'utf-8');
    }
  }
};

updateDataFiles();
