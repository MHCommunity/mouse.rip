import fs from 'node:fs';
import path from 'node:path';

/**
 * Imports mouse loot data from a CSV into `src/data/generated/mouse-loot.json`,
 * which powers the "Loot" section on each mouse page.
 *
 * The data comes from Alex Claxton's "Mouse Droppings and Item Droppers" viz:
 *   https://public.tableau.com/app/profile/alex.claxton/viz/MH-by-mouseID2/MouseDroppingsandItemDroppers
 *
 * Tableau Public renders its session client-side, so it can't be scraped from a
 * plain HTTP client. Instead, download the underlying data as CSV from the viz
 * (use the "Download" toolbar button → "Data" or "Crosstab"), then run:
 *
 *   bun ./scripts/import-mouse-loot.js <path-to.csv>
 *
 * Column names are detected loosely, so most export shapes work. It maps each
 * row to a mouse by id (preferred) or by name (via mice.json).
 */

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: bun ./scripts/import-mouse-loot.js <path-to.csv>');
  process.exit(1);
}

// Minimal CSV parser that handles quoted fields and embedded commas/newlines.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
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
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

function findColumn(headers, predicate) {
  return headers.findIndex((h) => predicate(h.toLowerCase().trim()));
}

const raw = fs.readFileSync(csvPath, 'utf-8');
const rows = parseCsv(raw);
if (rows.length < 2) {
  console.error('CSV appears to be empty.');
  process.exit(1);
}

const headers = rows[0];
const mouseIdCol = findColumn(headers, (h) => h.includes('mouse') && h.includes('id'));
const mouseNameCol = findColumn(headers, (h) => h.includes('mouse') && !h.includes('id'));
const itemCol = findColumn(headers, (h) => (h.includes('item') || h.includes('loot')) && !h.includes('id'));
const dropCol = findColumn(
  headers,
  (h) => h.includes('drop') || h.includes('rate') || h.includes('pct') || h.includes('%')
);
const minCol = findColumn(headers, (h) => h === 'min' || h.includes('min'));
const maxCol = findColumn(headers, (h) => h === 'max' || h.includes('max'));

if (itemCol === -1 || (mouseIdCol === -1 && mouseNameCol === -1)) {
  console.error('Could not detect mouse and item columns. Headers were:', headers);
  process.exit(1);
}

// Build a mouse-name → id map for rows that only carry a name.
const mice = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, '../src/data/generated/mice.json'), 'utf-8')
);
const idByName = new Map(mice.map((m) => [m.name.toLowerCase(), m.id]));

const toNumber = (value) => {
  if (value == null) return undefined;
  const n = Number.parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

const loot = {};
let skipped = 0;
for (let i = 1; i < rows.length; i++) {
  const cells = rows[i];
  const item = (cells[itemCol] ?? '').trim();
  if (!item) continue;

  let mouseId;
  if (mouseIdCol !== -1 && cells[mouseIdCol]) {
    mouseId = Number.parseInt(cells[mouseIdCol], 10);
  }
  if (!mouseId && mouseNameCol !== -1) {
    mouseId = idByName.get((cells[mouseNameCol] ?? '').trim().toLowerCase());
  }
  if (!mouseId) {
    skipped++;
    continue;
  }

  const entry = { item };
  const drop = toNumber(dropCol !== -1 ? cells[dropCol] : undefined);
  if (drop != null) entry.drop_pct = Math.round(drop * 100) / 100;
  const min = toNumber(minCol !== -1 ? cells[minCol] : undefined);
  const max = toNumber(maxCol !== -1 ? cells[maxCol] : undefined);
  if (min != null) entry.min = min;
  if (max != null) entry.max = max;

  (loot[mouseId] ??= []).push(entry);
}

// Sort each mouse's loot by drop rate, descending.
for (const id of Object.keys(loot)) {
  loot[id].sort((a, b) => (b.drop_pct ?? 0) - (a.drop_pct ?? 0));
}

const outPath = path.join(import.meta.dirname, '../src/data/generated/mouse-loot.json');
fs.writeFileSync(outPath, JSON.stringify(loot), 'utf-8');
console.log(
  `Wrote loot for ${Object.keys(loot).length} mice (${skipped} rows skipped for unmatched mice).`
);
