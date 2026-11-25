import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(__dirname, '../src/data/generated');
// Override to update from a local `wrangler dev` of the API.
const API_URL = process.env.API_URL ?? 'https://api.mouse.rip';
const pendingFiles = new Map();

// Written compact: only the build reads these, and it keeps the weekly diffs small.
const stage = (file, data) => {
  pendingFiles.set(file, `${JSON.stringify(data)}\n`);
};

const slugify = (value) => String(value).replaceAll('_', '-');

// MHCT logs a few areas under their own names, but they share a page here.
const DROP_LOCATION_ALIASES = {
  'Twisted Garden': 'Living Garden',
  'Cursed City': 'Lost City',
  'Sand Crypts': 'Sand Dunes',
};

const MIN_LOCATION_LOOT_CATCHES = 500;

// Without a timeout, one hung request would stall the weekly job until GitHub kills it.
const REQUEST_TIMEOUT_MS = 60_000;

const readGeneratedText = (file) => {
  try {
    return fs.readFileSync(path.join(DATA_DIR, `${file}.json`), 'utf-8');
  } catch {
    return null;
  }
};

const flushPendingFiles = () => {
  const changed = [...pendingFiles].filter(([file, contents]) => readGeneratedText(file) !== contents);
  // Only move the refresh time (sitemap lastmod) when the data itself changed,
  // so a week with no new data doesn't produce a commit.
  if (changed.length > 0) {
    changed.push(['data-updated', `${JSON.stringify({ updatedAt: new Date().toISOString() })}\n`]);
  }
  for (const [file, contents] of changed) {
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

// Labels allowed to shrink past the coverage floor on this run, for when the API
// deliberately serves less (e.g. ALLOW_SHRINK=item-drops,location-loot).
const ALLOW_SHRINK = new Set(
  (process.env.ALLOW_SHRINK ?? '')
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean),
);

export const validateMinimumCoverage = (label, currentCount, previousCount, ratio = 0.9) => {
  const minimum = Math.max(1, Math.floor(previousCount * ratio));
  if (currentCount < minimum && ALLOW_SHRINK.has(label)) {
    console.warn(`${label}: ${currentCount} records, down from ${previousCount}; allowed by ALLOW_SHRINK`);
    return;
  }
  if (currentCount < minimum) {
    throw new Error(
      `${label}: received ${currentCount} records; expected at least ${minimum} ` +
        `based on the previous ${previousCount} — refusing to replace the snapshot`,
    );
  }
};

// The game API sometimes returns names HTML-escaped (e.g. "&lt3 Gift Basket",
// without the semicolon). React renders those literally, so decode them once here.
const NAME_KEYS = new Set(['name', 'mouse_name', 'abbreviated_name', 'convertible']);
const ENTITIES = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", '#39': "'" };

const decodeEntities = (value) => value.replace(/&(lt|gt|amp|quot|apos|#39);?/g, (_, entity) => ENTITIES[entity]);

const decodeNameEntities = (value) => {
  if (Array.isArray(value)) return value.map(decodeNameEntities);
  if (value && 'object' === typeof value) {
    for (const [key, child] of Object.entries(value)) {
      value[key] = NAME_KEYS.has(key) && 'string' === typeof child ? decodeEntities(child) : decodeNameEntities(child);
    }
  }
  return value;
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
  // 'game-items' is the full game item catalog (served at /items).
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
      // browser. Shared by site search and the /items browser, so
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

    stage(file, json);

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
  const response = await fetch(`${API_URL}/${endpoint}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`${endpoint} responded ${response.status}`);
  }
  const json = await response.json();
  if (undefined === json || null === json) {
    throw new TypeError(`${endpoint} returned no JSON data`);
  }
  // Every response, not just the item list: names reach the site from several
  // endpoints (reverse convertibles, attraction, map relations…).
  return decodeNameEntities(json);
};

/**
 * Fetch one endpoint per entity, a few at a time, for data the API only serves
 * per entity.
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
          const response = await fetchImpl(`${API_URL}/${endpoint(id)}`, {
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          });
          // A 404 is a real answer: this entity has no rows.
          if (404 === response.status) {
            rows = [];
            break;
          }
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const json = await response.json();
          rows = decodeNameEntities(requireArray(json, `${label} entity ${id}`));
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
 * Loot seen in at least this share of locations is left off as event or global loot.
 *
 * Event and global drops (Party, Snowball and Wealth charms, SUPER|brie+, Ful'Mina's Gift…)
 * turn up at nearly every location, often at high rates, and would top every
 * location's loot list without saying anything about the place. Real location
 * loot is the opposite: almost every item drops in fewer than five locations.
 */
export const GLOBAL_LOOT_SHARE = 0.4;

/**
 * Seasonal event loot that any mouse can drop while the event runs.
 *
 * Lunar New Year candles, Spring Egg Hunt eggs and charge charms, Winter Hunt
 * gift boxes, birthday cupcakes, the yearly charms: it reaches too few locations
 * for the share rule to catch, but says nothing about the place.
 *
 * Listed by ID, not matched by name: plenty of real location loot shares a word
 * with event loot (Golden Goose Egg in Bountiful Beanstalk, Festive Spirit in
 * Cinnamon Hill), and the Great Winter Hunt's own locations keep their loot.
 * Each year's new charms need adding here.
 */
export const EVENT_LOOT_IDS = new Set([
  151, // Red Pocket Envelope
  437, // Red Winter Hunt Gift Box
  547, // Antique Green Plaid Egg
  549, // Antique Blue Argyle Egg
  550, // Antique Stripy Red Egg
  551, // Antique Wavy Purple Egg
  552, // Antique Scalloped Pink Egg
  553, // Gift Egg
  554, // Antique Sharing Egg
  555, // Antique Friendly Egg
  556, // Antique Caring Egg
  700, // Dreaded Charm
  701, // Spooky Charm
  823, // Party Charm
  1029, // Purple Winter Hunt Gift Box
  1164, // Eggscavator Charge Charm
  1228, // Sugar Rush Plushie
  1237, // Ultimate Spooky Charm
  1288, // Festive Ultimate Luck Charm
  1289, // Festive Ultimate Power Charm
  1290, // Snowball Charm
  1439, // High Charge Egg
  1442, // Low Charge Egg
  1443, // Lucky Egg
  1448, // Medium Charge Egg
  1451, // Gnawnia Rift Egg
  1576, // Super Spooky Charm
  1688, // Cupcake Charm
  1699, // Enlarged Rift Egg
  1714, // Eggstra Charge Charm
  1715, // Egg Basket Box Trap Skin
  1990, // Orange Winter Hunt Gift Box
  2038, // Extra Sweet Cupcake Charm
  2262, // 2017 Charm
  2269, // Lunar Lantern Candle
  2286, // Sprinkly Sweet Cupcake Charm
  2307, // Enerchi Egg
  2523, // Extreme Snowball Charm
  2527, // Super Snowball Charm
  2528, // Ultimate Snowball Charm
  2539, // 2018 Charm
  2547, // Red Lunar Lantern Candle
  2598, // Rainy Egg
  2603, // Windy Egg
  2701, // Extreme Spooky Charm
  2734, // 2019 Charm
  2799, // Over 9,000 Egg
  2801, // Queso Pump Egg
  2803, // Wild Tonic Egg
  2806, // Lightning Storm Egg
  2812, // Dragonshard Egg
  2957, // 2020 Charm
  2958, // Rift 2020 Charm
  2959, // Rift Extreme Snowball Charm
  2960, // Rift Snowball Charm
  2961, // Rift Super Snowball Charm
  2962, // Rift Ultimate Snowball Charm
  2990, // Extreme Party Charm
  2991, // Super Party Charm
  2992, // Ultimate Party Charm
  2995, // 20K Golden Egg
  3153, // 2021 Charm
  3154, // Rift 2021 Charm
  3366, // 2022 Charm
  3367, // Rift 2022 Charm
  3527, // 2023 Charm
  3528, // Rift 2023 Charm
  3630, // 2024 Charm
  3631, // Rift 2024 Charm
  3810, // Golden Winter Hunt Gift Box
  3817, // 2025 Charm
  3818, // Rift 2025 Charm
  3957, // 2026 Charm
  3958, // Rift 2026 Charm
]);

/**
 * Event loot that is real loot in the event's own locations but a stray drop
 * anywhere else. Keyed by item ID, with the locations (as keyed in
 * location-loot) where it belongs.
 */
const WINTER_HUNT_LOCATIONS = ['event area', 'cinnamon hill', 'golem workshop', 'ice fortress'];
export const EVENT_LOOT_HOMES = new Map([
  [3521, WINTER_HUNT_LOCATIONS], // Festive Spirit
]);

/** Whether a drop at this location says something about the place rather than an event. */
export const isLocationLoot = (itemId, location) => {
  if (EVENT_LOOT_IDS.has(itemId)) return false;
  const homes = EVENT_LOOT_HOMES.get(itemId);
  return !homes || homes.includes(location);
};

export const withoutGlobalLoot = (lootByLocation) => {
  const locationCount = Object.keys(lootByLocation).length;
  const seenIn = new Map();
  for (const rows of Object.values(lootByLocation)) {
    for (const row of rows) seenIn.set(row.id, (seenIn.get(row.id) ?? 0) + 1);
  }
  const isGlobal = (id) => seenIn.get(id) >= locationCount * GLOBAL_LOOT_SHARE;
  return Object.fromEntries(
    Object.entries(lootByLocation).map(([location, rows]) => [location, rows.filter((row) => !isGlobal(row.id))]),
  );
};

/**
 * The most useful single place to hunt a mouse, for the search index.
 *
 * The highest rate without a charm, preferring rows with a real sample (MH-Tools
 * rows have none and count as fine). When every row needs a charm, the charm is
 * part of the answer, so it's kept. Keep in step with bestAttractionRow() in
 * src/lib/attraction.ts.
 */
export const bestSpot = (rows) => {
  const plain = rows.filter((row) => !row.charm);
  const pool = plain.length > 0 ? plain : rows;
  const trusted = pool.filter((row) => null === row.total_hunts || row.total_hunts >= 100);
  const pick = [...(trusted.length > 0 ? trusted : pool)].sort((a, b) => b.rate - a.rate)[0];
  if (!pick) return undefined;
  return {
    location: pick.location,
    stage: pick.stage ?? undefined,
    cheese: pick.cheese,
    charm: pick.charm ?? undefined,
    rate: pick.rate,
    // Null for MH-Tools rates, which publish no sample size.
    hunts: pick.total_hunts ?? null,
  };
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

  // MHCT drop, attraction and map tables, baked in so item and mouse pages
  // ship them in the HTML instead of fetching them on every view. The API
  // builds all three in bulk each week, so this is a handful of requests
  // rather than one per item and mouse.
  //
  // Only the rows the pages actually render are kept. The long tail is mostly
  // small-sample noise, and storing all of it would triple these files for rows
  // nobody ever sees.
  const best = (rows, key, limit) => [...rows].sort((a, b) => Number(b[key]) - Number(a[key])).slice(0, limit);

  // Which mice drop each item, where. The API only serves this per mouse (or
  // per item), but the files behind it are static, so asking for each mouse is
  // quick and doesn't touch MHCT.
  console.log('Updating item-drops and location-loot (one request per mouse)...');
  const loot = await fetchPerEntity(
    'mouse-loot',
    mice.map((mouse) => mouse.id),
    (id) => `mouse-loot/${id}`,
  );
  const miceById = new Map(mice.map((mouse) => [mouse.id, mouse]));
  validateItemReferences(
    'mouse-loot',
    Object.values(loot).flatMap((rows) => rows.map((row) => row.item_id)),
    itemIds,
  );

  // Item pages: one row per mouse, its locations pooled, so a mouse that drops
  // the item everywhere it's caught doesn't fill the table on its own.
  const drops = {};
  for (const [mouseId, rows] of Object.entries(loot)) {
    const mouse = miceById.get(Number(mouseId));
    const byItem = Map.groupBy(rows, (row) => row.item_id);
    for (const [itemId, itemRows] of byItem) {
      const sorted = itemRows.toSorted((a, b) => b.catches - a.catches);
      const catches = sorted.reduce((sum, row) => sum + row.catches, 0);
      const dropped = sorted.reduce((sum, row) => sum + (row.drop_likelihood / 100) * row.catches, 0);
      (drops[itemId] ??= []).push({
        mouse_name: mouse.name,
        mouse_slug: slugify(mouse.type),
        locations: sorted.map((row) => row.location),
        catches,
        drop_likelihood: Math.round((10000 * dropped) / catches) / 100,
        min: Math.min(...sorted.map((row) => row.min)),
        max: Math.max(...sorted.map((row) => row.max)),
      });
    }
  }
  validateMinimumCoverage('item-drops', Object.keys(drops).length, Object.keys(readGenerated('item-drops', {})).length);
  stage(
    'item-drops',
    Object.fromEntries(
      Object.entries(drops).map(([id, rows]) => [
        id,
        rows.sort((a, b) => b.drop_likelihood - a.drop_likelihood || b.catches - a.catches).slice(0, 50),
      ]),
    ),
  );

  // Location pages: each item seen dropping there, with the mouse most likely
  // to drop it and that mouse's drop chance. A rate averaged across every mouse
  // at the location would hide that one mouse always drops it. Built from every
  // row, not just the ones the item pages keep.
  const itemsById = new Map(items.map((item) => [item.id, item]));
  // The mice that live at each location. A drop recorded there from any other
  // mouse came from an event visitor, not from the place itself.
  const regionList = pendingFiles.has('mice-regions')
    ? JSON.parse(pendingFiles.get('mice-regions'))
    : readGenerated('mice-regions', []);
  const nativeMice = new Map(regionList.map((region) => [region.name.toLowerCase(), new Set(region.mouse_ids)]));
  const lootByLocation = new Map();
  for (const [mouseId, rows] of Object.entries(loot)) {
    const mouse = miceById.get(Number(mouseId));
    for (const row of rows) {
      // From one mouse at a location, a small sample is mostly charm effects and event loot.
      if (row.catches < MIN_LOCATION_LOOT_CATCHES) continue;
      const location = (DROP_LOCATION_ALIASES[row.location] ?? row.location).toLowerCase();
      const native = nativeMice.get(location);
      if (native && !native.has(Number(mouseId))) continue;
      if (!isLocationLoot(row.item_id, location)) continue;
      const item = itemsById.get(row.item_id);
      const byItem = lootByLocation.get(location) ?? new Map();
      lootByLocation.set(location, byItem);
      const current = byItem.get(row.item_id);
      if (
        current &&
        (current.rate > row.drop_likelihood || (current.rate === row.drop_likelihood && current.catches >= row.catches))
      ) {
        continue;
      }
      byItem.set(row.item_id, {
        id: item.id,
        slug: slugify(item.type),
        name: item.name,
        rate: row.drop_likelihood,
        mouse_name: mouse.name,
        mouse_slug: slugify(mouse.type),
        catches: row.catches,
        min: row.min,
        max: row.max,
      });
    }
  }
  validateMinimumCoverage('location-loot', lootByLocation.size, Object.keys(readGenerated('location-loot', {})).length);
  stage(
    'location-loot',
    withoutGlobalLoot(
      Object.fromEntries(
        [...lootByLocation].map(([location, byItem]) => [
          location,
          [...byItem.values()].sort((a, b) => b.rate - a.rate || a.name.localeCompare(b.name)),
        ]),
      ),
    ),
  );

  // Attraction is published per population (location, stage, cheese, charm),
  // so turn it around into the populations that attract each mouse.
  console.log('Updating mice-attraction...');
  const populations = requireArray(await fetchJson('attraction'), 'attraction');
  const mouseIdByType = new Map(mice.map((mouse) => [mouse.type, mouse.id]));
  const attraction = {};
  for (const population of populations) {
    for (const mouse of population.mice ?? []) {
      const mouseId = mouseIdByType.get(mouse.type);
      if (!mouseId) continue;
      (attraction[mouseId] ??= []).push({
        location: population.location_name,
        stage: '-' === population.stage ? null : population.stage,
        cheese: population.cheese_name,
        charm: '-' === population.charm ? null : population.charm_name,
        // In hundredths of a percent, as MHCT reports it.
        rate: Math.round(mouse.rate * 100),
        total_hunts: population.sample_size ?? null,
      });
    }
  }
  validateMinimumCoverage(
    'mice-attraction',
    Object.keys(attraction).length,
    Object.keys(readGenerated('mice-attraction', {})).length,
  );
  const storedAttraction = Object.fromEntries(
    Object.entries(attraction).map(([id, rows]) => [id, best(rows, 'rate', 50)]),
  );
  stage('mice-attraction', storedAttraction);
  stage('map-planner', buildMapPlanner(attraction));

  // Fold each mouse's best place to hunt into the client search index, so search
  // can answer "where do I catch it" without shipping the full attraction table.
  // Picked from the stored rows, so it matches what the mouse page shows.
  const searchIndex = pendingFiles.has('mice-search')
    ? JSON.parse(pendingFiles.get('mice-search'))
    : readGenerated('mice-search', []);
  stage(
    'mice-search',
    searchIndex.map((mouse) => {
      const { best: _previous, ...rest } = mouse;
      const spot = bestSpot(storedAttraction[mouse.id] ?? []);
      return spot ? { ...rest, best: spot } : rest;
    }),
  );

  // The maps each mouse turns up on. Maps seen fewer than five times, and
  // retired maps, aren't worth listing.
  console.log('Updating mouse-maps...');
  const mapper = requireArray(await fetchJson('mhct/reverse-mapper'), 'mhct/reverse-mapper');
  const mouseMaps = {};
  for (const entry of mapper) {
    const rows = (entry.maps ?? [])
      .filter((map) => map.seen >= 5 && map.total >= 5 && !/\(retired\b/i.test(map.map))
      .map((map) => ({ map: map.map, rate: map.rate, seen_maps: map.seen, total_maps: map.total }));
    if (entry.id && rows.length > 0) mouseMaps[entry.id] = best(rows, 'rate', 40);
  }
  validateMinimumCoverage(
    'mouse-maps',
    Object.keys(mouseMaps).length,
    Object.keys(readGenerated('mouse-maps', {})).length,
  );
  stage('mouse-maps', mouseMaps);

  // data-updated (the refresh time for sitemap lastmod) is written by
  // flushPendingFiles, and only when some other file changed.
};

/** Below this, a setup can't help plan a map, so the planner never sees it. In hundredths of a percent. */
const PLANNER_MIN_RATE = 100;

/**
 * The attraction rows the map planner needs, small enough to send to the browser.
 *
 * One row per mouse and setup (location, stage, cheese), without a charm where MHCT
 * has that, since a charm is a choice the planner shouldn't make for you. Names are
 * stored once in lookup tables and rows point into them by index.
 */
export function buildMapPlanner(attraction) {
  const tables = { locations: [], stages: [''], cheeses: [], charms: [''] };
  const indexes = Object.fromEntries(Object.keys(tables).map((key) => [key, new Map(tables[key].map((v, i) => [v, i]))]));
  const indexOf = (key, value) => {
    let index = indexes[key].get(value);
    if (index === undefined) {
      index = tables[key].push(value) - 1;
      indexes[key].set(value, index);
    }
    return index;
  };

  const mice = {};
  for (const [id, rows] of Object.entries(attraction)) {
    const plain = rows.filter((row) => !row.charm);
    const bySetup = new Map();
    for (const row of plain.length > 0 ? plain : rows) {
      if (row.rate < PLANNER_MIN_RATE || !row.location || !row.cheese) continue;
      const key = `${row.location}|${row.stage ?? ''}|${row.cheese}`;
      const current = bySetup.get(key);
      if (!current || row.rate > current.rate) bySetup.set(key, row);
    }
    if (bySetup.size === 0) continue;
    mice[id] = [...bySetup.values()]
      .sort((a, b) => b.rate - a.rate)
      .map((row) => {
        const entry = [
          indexOf('locations', row.location),
          indexOf('stages', row.stage ?? ''),
          indexOf('cheeses', row.cheese),
          row.rate,
          row.total_hunts ?? 0,
        ];
        if (row.charm) entry.push(indexOf('charms', row.charm));
        return entry;
      });
  }

  return { ...tables, mice };
}

if (import.meta.main) {
  updateDataFiles().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
