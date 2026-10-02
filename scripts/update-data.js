import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(__dirname, '../src/data/generated');
const pendingFiles = new Map();

const stage = (file, data, { pretty = false } = {}) => {
  pendingFiles.set(file, `${JSON.stringify(data, null, pretty ? 2 : undefined)}\n`);
};

const flushPendingFiles = () => {
  for (const [file, contents] of pendingFiles) {
    fs.writeFileSync(path.join(DATA_DIR, `${file}.json`), contents, 'utf-8');
  }
};

const readGenerated = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${file}.json`), 'utf-8'));
  } catch {
    return fallback;
  }
};

export const requireArray = (value, label) => {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} returned ${null === value ? 'null' : typeof value}; expected an array`);
  }
  return value;
};

const requireRecord = (value, label) => {
  if (!value || Array.isArray(value) || 'object' !== typeof value) {
    throw new TypeError(`${label} returned ${null === value ? 'null' : typeof value}; expected an object`);
  }
  return value;
};

export const validateMinimumCoverage = (label, currentCount, previousCount, ratio = 0.9) => {
  const minimum = Math.max(1, Math.floor(previousCount * ratio));
  if (currentCount < minimum) {
    throw new Error(
      `${label}: received ${currentCount} records; expected at least ${minimum} ` +
        `based on the previous ${previousCount} — refusing to replace the snapshot`,
    );
  }
};

const updateDataFiles = async () => {
  const files = [
    { file: 'environments-events', shape: 'array', validateCoverage: false },
    { file: 'environments', shape: 'array', validateCoverage: true },
    { file: 'mice', shape: 'array', validateCoverage: true },
    { file: 'mice-groups', shape: 'array', validateCoverage: true },
    { file: 'mice-regions', shape: 'array', validateCoverage: true },
    { file: 'titles', shape: 'array', validateCoverage: true },
    { file: 'relic-hunter-hints', shape: 'record', validateCoverage: true },
    { file: 'game-items', shape: 'array', validateCoverage: true },
  ];

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

  let gameItems = [];
  let mice = [];

  // Fetch and validate every source before replacing any generated file.
  // 'game-items' is the full game item catalog (served at /items), saved compact
  // since it is large and only read at build time.
  for (const config of files) {
    const { file } = config;
    const endpoint = 'game-items' === file ? 'items' : file;
    let json = await fetchJson(endpoint);
    json = 'array' === config.shape ? requireArray(json, endpoint) : requireRecord(json, endpoint);

    if (config.validateCoverage) {
      const previous = readGenerated(file, 'array' === config.shape ? [] : {});
      validateMinimumCoverage(
        file,
        'array' === config.shape ? json.length : Object.keys(json).length,
        'array' === config.shape && Array.isArray(previous) ? previous.length : Object.keys(previous).length,
      );
    }

    console.log(`Updating ${file}...`);

    if ('game-items' === file) {
      json = json.filter((item) => !itemsToSkip.has(item.type));
      gameItems = json;
      stage(file, json);

      // The client-side item index: the only item data that ever reaches the
      // browser. Shared by site search, the /items browser, and /marketplace, so
      // it downloads once and stays cached — carry every field they filter on.
      const slim = json.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        classification: item.classification,
        tradable: item.is_tradable || undefined,
        tags: item.tags?.length ? item.tags : undefined,
      }));
      stage('game-items-search', slim);

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
        if (stripped !== name && !cheese[stripped]) cheese[stripped] = itemSlug;
      }
      const locations = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/locations.json'), 'utf-8'));
      const location = {};
      for (const region of locations) {
        for (const loc of region.locations) location[loc.name.toLowerCase()] = loc.id;
      }
      stage('name-lookup', { cheese, location });
      continue;
    }

    stage(file, json, { pretty: true });

    if ('mice' === file) {
      mice = json;
      // The client-side mouse index, shared by site search, the /mice browser
      // and the minlucks table (the full file is ~3MB and would otherwise ship
      // to the client).
      const slim = json.map((mouse) => {
        // Non-zero power-type effectivenesses, so the browser can work out what
        // a mouse is weak to with bestPowerTypes() rather than this script
        // re-implementing the rule. `power` is the mouse's power stat, not a
        // power type, so it doesn't belong here.
        const eff = {};
        for (const [type, value] of Object.entries(mouse.effectivenesses ?? {})) {
          if ('power' !== type && value > 0) eff[type] = value;
        }

        return {
          id: mouse.id,
          type: mouse.type,
          name: mouse.name,
          abbreviated_name: mouse.abbreviated_name,
          group: mouse.group,
          subgroup: mouse.subgroup,
          minlucks: mouse.minlucks,
          eff: Object.keys(eff).length > 0 ? eff : undefined,
        };
      });
      stage('mice-search', slim);
    }
  }

  await updateRelationalData(gameItems, mice);
  flushPendingFiles();
};

const fetchJson = async (endpoint) => {
  const response = await fetch(`https://api.mouse.rip/${endpoint}`);
  if (!response.ok) {
    throw new Error(`${endpoint} responded ${response.status}`);
  }
  const json = await response.json();
  if (undefined === json || null === json) {
    throw new TypeError(`${endpoint} returned no JSON data`);
  }
  return json;
};

/**
 * Fetch one endpoint per entity, a few at a time. These datasets have no bulk
 * endpoint, so the only way to bake them into the pages is to ask for each one.
 *
 * A 404 is a legitimate empty result. Any other failure after retries aborts the
 * update, because omitting even one failed entity would replace a complete
 * snapshot with partial data.
 */
export const fetchPerEntity = async (
  label,
  ids,
  endpoint,
  { concurrency = 12, fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {},
) => {
  const results = {};
  const failures = [];
  let done = 0;
  let cursor = 0;

  const worker = async () => {
    while (cursor < ids.length) {
      const id = ids[cursor++];
      let rows = null;
      let lastError = null;
      for (let attempt = 0; attempt < 3 && rows === null; attempt++) {
        try {
          const response = await fetchImpl(`https://api.mouse.rip/${endpoint(id)}`);
          // A 404 is a real answer: this entity has no rows.
          if (404 === response.status) {
            rows = [];
            break;
          }
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const json = await response.json();
          rows = requireArray(json, `${label} entity ${id}`);
        } catch (error) {
          lastError = error;
          if (attempt === 2) break;
          await sleep(300 * (attempt + 1));
        }
      }

      if (rows === null) {
        failures.push({ id, error: lastError });
      } else if (rows.length > 0) {
        results[id] = rows;
      }

      done++;
      if (0 === done % 500) console.log(`  ${label}: ${done}/${ids.length}`);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  if (failures.length > 0) {
    const sample = failures
      .slice(0, 8)
      .map(({ id, error }) => `${id} (${error instanceof Error ? error.message : 'unknown error'})`)
      .join(', ');
    throw new Error(
      `${label}: ${failures.length}/${ids.length} requests failed after retries: ${sample} — ` +
        'refusing to write a partial dataset',
    );
  }
  console.log(`  ${label}: ${Object.keys(results).length} with data of ${ids.length}`);
  return results;
};

export const selectPreferredItemsByName = (items) => {
  const selected = new Map();
  for (const item of items) {
    const current = selected.get(item.name);
    if (!current || ('convertible' === item.classification && 'convertible' !== current.classification)) {
      selected.set(item.name, item);
    }
  }
  return selected;
};

export const validateItemReferences = (label, ids, itemIds) => {
  const normalized = ids.map(Number);
  if (normalized.some((id) => !Number.isFinite(id))) {
    throw new TypeError(`${label}: contains an invalid item ID`);
  }
  const missing = [...new Set(normalized.filter((id) => !itemIds.has(id)))];
  if (missing.length > 0) {
    throw new Error(
      `${label}: references ${missing.length} item IDs absent from game-items.json: ` + missing.slice(0, 20).join(', '),
    );
  }
};

/**
 * Pull the relational datasets the API generates. These are what let an item
 * page say what it opens into, what opens into it, and where a mouse is found —
 * all at build time, so the pages server-render those answers.
 */
const updateRelationalData = async (items, mice) => {
  const itemIds = new Set(items.map((item) => item.id));

  // Scroll case -> map -> treasure chests. Small, used as-is.
  console.log('Updating map-relations...');
  const mapRelations = requireArray(await fetchJson('map-relations'), 'map-relations');
  validateMinimumCoverage('map-relations', mapRelations.length, readGenerated('map-relations', []).length);
  validateItemReferences(
    'map-relations',
    mapRelations.flatMap((relation) => [relation.scrollCase?.id, ...(relation.chests ?? []).map((chest) => chest.id)]),
    itemIds,
  );
  stage('map-relations', mapRelations);

  // Item -> the convertibles that contain it. Preserve catalog IDs when a
  // source still exists; historical/virtual sources remain unlinked names.
  console.log('Updating item-found-in...');
  const reverse = requireArray(await fetchJson('mhct-reverse-convertibles'), 'mhct-reverse-convertibles');
  const itemByName = selectPreferredItemsByName(items);
  const foundIn = {};
  for (const entry of reverse) {
    const convertibles = new Map();
    for (const row of entry.convertibles ?? []) {
      if (!row.convertible) continue;
      const item = itemByName.get(row.convertible);
      if (!item) {
        convertibles.set(`name:${row.convertible}`, { name: row.convertible });
        continue;
      }
      convertibles.set(item.id, { id: item.id, name: item.name });
    }
    if (entry.mhct_id && convertibles.size > 0) {
      foundIn[entry.mhct_id] = [...convertibles.values()];
    }
  }
  validateItemReferences('item-found-in rewards', Object.keys(foundIn), itemIds);
  validateItemReferences(
    'item-found-in convertibles',
    Object.values(foundIn).flatMap((rows) => rows.map((row) => row.id).filter(Boolean)),
    itemIds,
  );
  validateMinimumCoverage(
    'item-found-in',
    Object.keys(foundIn).length,
    Object.keys(readGenerated('item-found-in', {})).length,
  );
  stage('item-found-in', foundIn);

  // Junk items (gift baskets, blueprints) that shouldn't clutter the marketplace.
  console.log('Updating marketplace-hidden-items...');
  const hidden = requireArray(await fetchJson('marketplace-hidden-items'), 'marketplace-hidden-items');
  const hiddenIds = hidden.map((item) => item.id).filter((id) => Number.isFinite(id));
  validateMinimumCoverage(
    'marketplace-hidden-items',
    hiddenIds.length,
    readGenerated('marketplace-hidden-items', []).length,
  );
  stage('marketplace-hidden-items', hiddenIds);

  // What each convertible opens into. Inverted out of the reverse-convertibles
  // data we already have above, rather than asking /convertible/{id} 1,380 more
  // times: an item's entry there carries the same quantities, and its chance is
  // times_with_any / single_opens.
  console.log('Updating convertible-contents...');
  const contents = {};
  for (const entry of reverse) {
    if (!entry.mhct_id) continue;
    for (const row of entry.convertibles ?? []) {
      const convertibleId = itemByName.get(row.convertible)?.id;
      if (!convertibleId || !row.single_opens) continue;
      (contents[convertibleId] ??= []).push({
        id: entry.mhct_id,
        name: entry.name,
        min: row.min_item_quantity ?? 0,
        max: row.max_item_quantity ?? 0,
        chance: ((100 * row.times_with_any) / row.single_opens).toFixed(2),
      });
    }
  }
  for (const rows of Object.values(contents)) {
    rows.sort((a, b) => Number(b.chance) - Number(a.chance) || a.name.localeCompare(b.name));
  }
  validateItemReferences('convertible-contents convertibles', Object.keys(contents), itemIds);
  validateItemReferences(
    'convertible-contents rewards',
    Object.values(contents).flatMap((rows) => rows.map((row) => row.id)),
    itemIds,
  );
  validateMinimumCoverage(
    'convertible-contents',
    Object.keys(contents).length,
    Object.keys(readGenerated('convertible-contents', {})).length,
  );
  stage('convertible-contents', contents);

  // The three datasets with no bulk endpoint. Baked in so item and mouse pages
  // ship their drop/attraction tables in the HTML instead of fetching them on
  // every view.
  //
  // Only the rows the pages actually render are kept. The long tail is mostly
  // one-hunt noise — a single item has 1,490 recorded location/cheese rows — and
  // storing all of it would triple these files for rows nobody ever sees.
  const best = (rows, key, limit) => [...rows].sort((a, b) => Number(b[key]) - Number(a[key])).slice(0, limit);

  console.log('Updating item-drops (one request per item)...');
  const drops = await fetchPerEntity(
    'item-drops',
    items.map((item) => item.id),
    (id) => `mhct-item/${id}`,
  );
  validateMinimumCoverage('item-drops', Object.keys(drops).length, Object.keys(readGenerated('item-drops', {})).length);
  stage(
    'item-drops',
    Object.fromEntries(
      Object.entries(drops).map(([id, rows]) => [id, { rows: best(rows, 'drop_pct', 50), total: rows.length }]),
    ),
  );

  console.log('Updating mice-attraction (one request per mouse)...');
  const attraction = await fetchPerEntity(
    'mice-attraction',
    mice.map((mouse) => mouse.id),
    (id) => `mhct/${id}`,
  );
  validateMinimumCoverage(
    'mice-attraction',
    Object.keys(attraction).length,
    Object.keys(readGenerated('mice-attraction', {})).length,
  );
  stage(
    'mice-attraction',
    Object.fromEntries(Object.entries(attraction).map(([id, rows]) => [id, best(rows, 'rate', 50)])),
  );

  console.log('Updating mouse-maps (one request per mouse)...');
  const mouseMaps = await fetchPerEntity(
    'mouse-maps',
    mice.map((mouse) => mouse.id),
    (id) => `maps-for-mouse/${id}`,
  );
  validateMinimumCoverage(
    'mouse-maps',
    Object.keys(mouseMaps).length,
    Object.keys(readGenerated('mouse-maps', {})).length,
  );
  stage('mouse-maps', Object.fromEntries(Object.entries(mouseMaps).map(([id, rows]) => [id, best(rows, 'rate', 40)])));

  // Record the refresh time for sitemap lastmod; checkout and build times do
  // not indicate when the data changed.
  stage('data-updated', { updatedAt: new Date().toISOString() });
};

if (import.meta.main) {
  updateDataFiles().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
