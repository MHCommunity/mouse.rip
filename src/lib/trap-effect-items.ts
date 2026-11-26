/**
 * The items a trap effect names. The community sheet names them loosely ("SLAC (II)", "Soul Catcher / Harvester",
 * "(Maniacal) Brain Extractor"), so this tries a few readings of each name and keeps only clear matches.
 */

export interface NamedItem {
  type: string;
  name: string;
}

/** Letters and digits only, so "S.L.A.C." and "SLAC" compare equal. */
const compact = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const SUFFIXES = ['', ' Trap', ' Base', ' Charm', ' Cheese'];
/** A prefix shorter than this matches too much to trust. */
const MIN_PREFIX = 8;

function matchReading(reading: string, byKey: Map<string, NamedItem>, keys: string[]): NamedItem | undefined {
  for (const suffix of SUFFIXES) {
    const found = byKey.get(compact(reading + suffix));
    if (found) return found;
  }
  // "Zugzwang's Ultimate" for Zugzwang's Ultimate Move: a prefix of exactly one item's name.
  const key = compact(reading);
  if (key.length < MIN_PREFIX) return undefined;
  const matches = keys.filter((candidate) => candidate.startsWith(key));
  return matches.length === 1 ? byKey.get(matches[0]) : undefined;
}

/**
 * Brackets mean "with or without": "(Maniacal) Brain Extractor" is the Brain Extractor and the Maniacal one,
 * "SLAC (II)" the S.L.A.C. and the S.L.A.C. II. Both are linked when both exist.
 */
function matchPart(part: string, byKey: Map<string, NamedItem>, keys: string[]): NamedItem[] {
  const plain = matchReading(part.replace(/\([^)]*\)/g, ' '), byKey, keys);
  const upgraded = part.includes('(') ? matchReading(part, byKey, keys) : undefined;
  return [plain, upgraded].filter((item): item is NamedItem => Boolean(item));
}

export function matchEffectItems(name: string, items: NamedItem[]): NamedItem[] {
  const byKey = new Map(items.map((item) => [compact(item.name), item]));
  const keys = [...byKey.keys()];
  const found = new Map<string, NamedItem>();
  // "Soul Catcher / Harvester" names two items; "Any Drillbot" names a group, which isn't an item.
  for (const part of name.split('/').map((piece) => piece.trim())) {
    if (!part || /^any\b/i.test(part)) continue;
    for (const item of matchPart(part, byKey, keys)) found.set(item.type, item);
  }
  return [...found.values()];
}
