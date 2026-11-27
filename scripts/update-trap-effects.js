/**
 * Rebuild src/data/trap-effects.json from the community Location Trap Effects spreadsheet.
 *
 * The sheet has one row per location: region (only on a region's first row), location, then one cell per
 * trap, base or charm, holding its name on the first line and its effect below.
 */
import fs from 'node:fs';
import path from 'node:path';

const SHEET_CSV =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRg_s_It1mDCefWgwc-7Gexr5Hc7lKBztFue9kYZidI76iodSUan3BoGsagLCI1M26U_zG7uVMe9kgK/pub?gid=0&single=true&output=csv';
const OUT_FILE = path.join(__dirname, '../src/data/trap-effects.json');

/** The sheet's own shorthand, which reads as a mistake or as filler once it's out of the sheet. */
const NAME_FIXES = { 'Black Widow': 'Black Widow Base' };
const EFFECT_FIXES = {
  'Black Widow drops bonus loot': 'Bonus loot from the Black Widow Mouse',
  'Doubles tier 2 potions drops': 'Doubles tier 2 potion drops',
};
// Ultimate Chrome Base rows end with a pointer back to the sheet's "Everywhere" rows, which the page already lists.
const TRAILING_NOTES = [/\s*\.\.\.\s*and Everywhere things$/i, /\s*\.\.\.\s*and so much more!$/i];

/** Minimal RFC 4180 parser: quoted fields may hold commas, doubled quotes and newlines. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const tidy = (value) =>
  value
    .replaceAll('\r', '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,])/g, '$1')
    .trim();

function parseCell(cell) {
  const lines = cell
    .replaceAll('\r', '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  // A name that wraps ends its first line with a slash: "(Chrome) Stormwrought Ballista/" then "Dragon Slayer Cannon".
  while (lines.length > 2 && lines[0].endsWith('/')) {
    lines.splice(0, 2, `${lines[0]} ${lines[1]}`);
  }
  const name = tidy(lines[0] ?? '');
  let effect = tidy(lines.slice(1).join(' '));
  for (const note of TRAILING_NOTES) effect = effect.replace(note, '');
  return { name: NAME_FIXES[name] ?? name, effect: EFFECT_FIXES[effect] ?? effect };
}

export function sheetToEffects(rows) {
  const locations = [];
  let region = '';
  for (const row of rows.slice(1)) {
    if (row[0]?.trim()) region = tidy(row[0]);
    const location = tidy(row[1] ?? '');
    if (!location) continue;
    const effects = row
      .slice(2)
      .filter((cell) => cell.trim())
      .map(parseCell)
      .filter((effect) => effect.name);
    locations.push({ region, location, effects });
  }
  return locations;
}

async function main() {
  const response = await fetch(SHEET_CSV, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Sheet request failed: ${response.status} ${response.statusText}`);
  const locations = sheetToEffects(parseCsv(await response.text()));
  const effectCount = locations.reduce((sum, location) => sum + location.effects.length, 0);
  if (locations.length < 50 || effectCount < 100) {
    throw new Error(`Sheet parsed to ${locations.length} locations and ${effectCount} effects; refusing to overwrite.`);
  }
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(locations, null, 2)}\n`, 'utf-8');
  console.log(
    `Wrote ${locations.length} locations and ${effectCount} effects to ${path.relative(process.cwd(), OUT_FILE)}`,
  );
}

if (import.meta.main) {
  await main();
}
