// Utility functions for MouseHunt

// Map classification types to display names.
export const classificationNames = {
  bait: 'Bait',
  base: 'Base',
  weapon: 'Weapon',
  charm: 'Charm',
  potion: 'Potion',
  crafting_item: 'Crafting Item',
  collectible: 'Collectible',
  map_piece: 'Map Piece',
  achievement: 'Achievement',
  adventure: 'Adventure Item',
  bonus_loot: 'Bonus Loot',
  message_item: 'Message Item',
  quest: 'Quest Item',
  readiness_item: 'Readiness Item',
  skin: 'Skin',
  stat: 'Stat Item',
  torn_page: 'Torn Page',
  trinket: 'Charm',
  trinket_slot: 'Trinket Slot',
  convertible: 'Convertible',
  mouse: 'Mouse',
  mouse_group: 'Mouse Group'
};

export const classificationsNames = {
  bait: 'Cheeses',
  base: 'Bases',
  weapon: 'Weapons',
  charm: 'Charms',
  potion: 'Potions',
  crafting_item: 'Crafting Items',
  collectible: 'Collectibles',
  map_piece: 'Map Pieces',
  skin: 'Trap Skins',
  stat: 'Stat Items',
  torn_page: 'Torn Pages',
  trinket: 'Charms',
  convertible: 'Convertibles',
  other: 'Other Items',
};

export const classificationCollectibles = [
  'collectible',
  'message_item',
];

export const classificationOther = [
  'achievement',
  'adventure',
  'bonus_loot',
  'other',
  'quest',
  'readiness_item',
  'trinket_slot',
];

// TODO:: decide what to do with these and also map them to names
export const validTags = [
  // 'achievement',
  // 'acolyte_realm',
  // 'adventure_boss',
  // 'adventure_map_piece',
  // 'adventure_trap',
  'adventure',
  'adventuring',
  // 'ancient_city',
  // 'arcane',
  // 'bait_standard',
  'bait',
  // 'balacks_cove',
  'base',
  // 'bazaar',
  'blueprints',
  // 'boiling_cauldron_set',
  // 'bonus_loot',
  // 'bountiful_beanstalk',
  // 'bristle_woods',
  // 'cape_clawed',
  // 'catacombs',
  // 'champion_trinket_set',
  'charms',
  'cheese',
  // 'claw_shot_city',
  'codex',
  'collectible',
  'convertible',
  'convertibles',
  'cosmetics',
  'crafting_item',
  // 'crystal_library',
  'currency',
  // 'derr_dunes',
  // 'desert_oasis_corrupted',
  // 'desert_oasis_normal',
  // 'desert_oasis',
  // 'digby',
  // 'dojo',
  // 'dracano',
  // 'draconic_depths',
  // 'draconic',
  // 'elub_shore',
  'equipment',
  // 'event',
  // 'fiery_warpath',
  // 'floating_islands',
  // 'folklore_forest',
  // 'forbidden_grove',
  // 'forgotten',
  // 'fort_rox',
  // 'fungal_cavern',
  // 'furoma',
  'general',
  'great_winter_hunt',
  // 'halloween_event_location',
  // 'halloween',
  // 'hydro',
  // 'iceberg',
  // 'jungle_of_dread',
  // 'kings_gauntlet',
  // 'laboratory',
  // 'labyrinth',
  // 'law',
  // 'lost_city_cursed',
  // 'lost_city_normal',
  // 'lunar_new_year',
  'map_piece',
  'message_item',
  // 'mountain',
  'mousehunt_birthday',
  // 'mousoleum',
  // 'moussu_picchu',
  // 'muridae_market',
  // 'nerg_plains',
  // 'new_year',
  // 'parental',
  // 'patricks',
  // 'physical',
  // 'polluted_set',
  'potion',
  // 'prologue_pond',
  // 'queso_canyon',
  // 'queso_geyser',
  // 'queso_plains',
  // 'queso_quarry',
  // 'queso_river',
  // 'quest',
  // 'readiness_item',
  'resources',
  // 'rift_bristle_woods',
  // 'rift_burroughs',
  // 'rift_furoma',
  // 'rift_gnawnia',
  // 'rift_valour',
  // 'rift_whisker_woods',
  // 'rift',
  // 'ronzas_traveling_shoppe',
  // 'sand_dunes_crypt',
  // 'sand_dunes_normal',
  // 'sandtail',
  // 'school_of_sorcery',
  'scroll_case',
  // 'seasonal_garden',
  // 'shadow',
  'skin',
  // 'slushy_shoreline',
  // 'special',
  'spring_hunt',
  // 'ss_huntington_iii',
  'stat',
  // 'sunken_city',
  // 'table_of_contents',
  // 'tactical',
  // 'theme scraps',
  // 'theme_scraps',
  'theme',
  'tools',
  'torn_page',
  // 'tournament_hall',
  // 'tournament',
  // 'toxic_spill',
  // 'train_station',
  // 'trap parts',
  // 'trap_parts',
  'treasure_chests',
  // 'tribal_isles',
  // 'trinket_slot',
  'trinket',
  // 'valentines',
  'vintage',
  'weapon',
  // 'whisker_woods',
  // 'windmill',
  // 'zz_tower',
];

export const tagNames = {

};

/**
 * Normalizes a classification to a standard name.
 *
 * @param {string} classification The classification to normalize
 *
 * @return {string} The normalized classification name
 */
export function getClassification(classification) {
  if (classificationCollectibles.includes(classification)) {
    return 'collectible';
  }

  if (classificationOther.includes(classification)) {
    return 'other';
  }

  return classification;
}

/**
 * Returns a list of classifications for filtering based on the provided classification.
 *
 * @param {string} classification The classification to filter by
 *
 * @return {string[]} An array of classifications suitable for filtering
 */
export function getClassificationForFilter(classification) {
  if ('collectible' === classification) {
    return classificationCollectibles;
  }

  if ('other' === classification) {
    return classificationOther;
  }

  return [classification];
}

/**
 * Cleans HTML from a string, removing tags and normalizing whitespace.
 *
 * @param {string} desc The HTML string to clean
 *
 * @return {string} The cleaned string
 */
export function cleanDescription(desc) {
  return (desc || '')
    .replace(/\\n/g, '\n') // Handle escaped newlines
    .replace(/\\"/g, '"') // Unescape double quotes
    .replace(/&quot;/g, '"') // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
    .replace(/<\/?[^>]+(>|$)/g, '') // Strip all HTML tags
    .replace(/\n{2,}/g, '\n') // Collapse double (or more) newlines to one
    // .replace(/\s+/g, ' ') // Normalize whitespace
    .trim(); // Final trim
}

/**
 * Formats a number with commas as thousands separators.
 *
 * @param {number} num The number to format
 *
 * @return {string} The formatted number as a string
 */
export function formatNumber(num) {
  return num?.toLocaleString() || '0';
}

/**
 * Formats a boolean value to a human-readable string.
 *
 * @param {boolean} value The boolean value to format
 *
 * @return {string} 'Yes' for true, 'No' for false
 */
export function formatBoolean(value) {
  return value ? 'Yes' : 'No';
}
