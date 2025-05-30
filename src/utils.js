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
  trinket: 'Trinket',
  trinket_slot: 'Trinket Slot',
  convertible: 'Convertible Item',
  mouse: 'Mouse',
  mouse_group: 'Mouse Group'
};

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
    .replace(/\s+/g, ' ') // Normalize whitespace
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
