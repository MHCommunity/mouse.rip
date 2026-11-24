import { getResources, getLocations, getTitles, getEnvironments } from '@/lib/site-data';
import { classificationName } from '@/lib/item-classifications';
import miceGroups from '@/data/generated/mice-groups.json';
import { loadItemIndex, loadMouseIndex, type IndexedItem, type IndexedMouse } from '@/lib/client-index';
import { POWER_TYPES, bestPowerTypes, powerTypeSetLabel } from '@/lib/power-types';
import { itemImageUrl, locationImageUrl, mouseGroupImageUrl, mouseImageUrl, titleImageUrl } from '@/lib/image-urls';

export type SearchGroup = 'Pages' | 'Mice' | 'Groups' | 'Locations' | 'Items' | 'Guides' | 'Resources' | 'Titles';

/** What a record is, finer than its display group: lets "beginner guide" favour guides. */
export type SearchKind =
  | 'page'
  | 'mouse'
  | 'group'
  | 'location'
  | 'item'
  | 'guide'
  | 'tool'
  | 'extension'
  | 'spreadsheet'
  | 'userscript'
  | 'title';

/** The numbers a hunter usually wants from a mouse, so search can answer without a page load. */
export interface MouseAnswer {
  /** Lowest minlucks first, each with the power types that share it. */
  minlucks: { value: number; label: string }[];
  weakTo: string[];
  best?: IndexedMouse['best'];
}

export interface SearchRecord {
  id: string;
  group: SearchGroup;
  kind: SearchKind;
  mouse?: MouseAnswer;
  title: string;
  subtitle?: string;
  /** A short, highlighted fact shown on the right of the row (e.g. a mouse's minluck). */
  badge?: string;
  href: string;
  external?: boolean;
  image?: string;
  /** Haystack used for matching; normalized together with the query. */
  keywords: string;
}

// Order controls how groups are stacked in the results list.
export const GROUP_ORDER: SearchGroup[] = [
  'Pages',
  'Mice',
  'Groups',
  'Locations',
  'Items',
  'Guides',
  'Resources',
  'Titles',
];

const PAGE_RECORDS: SearchRecord[] = [
  ['/', 'Home', 'Guides, tools, and resources', 'home start overview'],
  [
    '/mice',
    'Mice & groups',
    'Browse mice by group or power type',
    'mice mouse bestiary stats minluck groups clan tribe',
  ],
  ['/items', 'Items', 'Browse every item', 'items weapons bases charms cheese collectibles'],
  ['/guides', 'Guides', 'Walkthroughs and strategy', 'guides walkthrough strategy how to'],
  ['/extensions', 'Extensions', 'Browser add-ons', 'extensions browser add-ons addons'],
  ['/tools', 'Tools', 'Calculators and lookups', 'tools calculators simulators lookups'],
  ['/spreadsheets', 'Spreadsheets', 'Community sheets', 'spreadsheets sheets google docs'],
  ['/userscripts', 'Userscripts', 'Scripts for the game UI', 'userscripts scripts tampermonkey'],
  ['/minlucks', 'Minlucks', 'Minimum luck to guarantee a catch', 'minluck minlucks luck catch rate power type mouse'],
  ['/titles', 'Titles & ranks', 'Ranks and wisdom requirements', 'titles ranks wisdom novice fabled'],
  ['/relic-hunter', 'Relic Hunter', "Where she's hiding and her riddles", 'relic hunter riddle hint'],
  [
    '/trap-special-effects',
    'Trap and Base Special Effects',
    'Location-specific trap and base effects',
    'trap base special effects bonus location',
  ],
  ['/valour-rift-floors', 'Valour Rift Floors', 'Floor-by-floor reference', 'valour rift floors tower eclipse'],
  ['/essence-calculator', 'Essence Calculator', 'Floating Islands essence', 'essence calculator floating islands'],
  [
    '/queso-pump-calculator',
    'Queso Pump Calculator',
    'Queso geyser pump planning',
    'queso pump calculator geyser river',
  ],
  ['/about', 'About', 'About mouse.rip', 'about contact info'],
].map(([href, title, subtitle, keywords]) => ({
  id: `page-${href}`,
  group: 'Pages' as const,
  kind: 'page' as const,
  title,
  subtitle,
  href,
  keywords: `${title} ${subtitle} ${keywords}`.toLowerCase(),
}));

function mouseAnswer(mouse: IndexedMouse): MouseAnswer {
  const byValue = new Map<number, string[]>();
  for (const type of POWER_TYPES) {
    const value = mouse.minlucks?.[type as keyof NonNullable<IndexedMouse['minlucks']>];
    if (typeof value !== 'number' || value <= 0) continue;
    byValue.set(value, [...(byValue.get(value) ?? []), type]);
  }
  const minlucks = [...byValue.entries()]
    .sort(([a], [b]) => a - b)
    .map(([value, types]) => ({ value, label: powerTypeSetLabel(types) }));
  return { minlucks, weakTo: bestPowerTypes(mouse.eff), best: mouse.best };
}

function toMouseRecord(mouse: IndexedMouse): SearchRecord {
  const subtitle = [mouse.group, mouse.subgroup].filter(Boolean).join(' · ') || undefined;
  const answer = mouseAnswer(mouse);
  const lowest = answer.minlucks[0];
  return {
    id: `mouse-${mouse.id}`,
    group: 'Mice',
    kind: 'mouse',
    title: mouse.name,
    subtitle,
    badge: lowest ? `Minluck ${lowest.value} · ${lowest.label}` : undefined,
    mouse: answer,
    href: `/mice/${mouse.type.replaceAll('_', '-')}`,
    image: mouseImageUrl(mouse.type),
    keywords:
      `${mouse.name} ${mouse.abbreviated_name ?? ''} ${mouse.group} ${mouse.subgroup ?? ''} mouse`.toLowerCase(),
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

let staticRecords: SearchRecord[] | null = null;

/** Records for everything except mice — cheap to build and bundle. */
export function getStaticSearchRecords(): SearchRecord[] {
  if (staticRecords) return staticRecords;

  const records: SearchRecord[] = [...PAGE_RECORDS];

  for (const group of miceGroups as {
    id: string;
    name: string;
    description_short?: string;
    banner?: string;
    mouse_ids: number[];
  }[]) {
    records.push({
      id: `group-${group.id}`,
      group: 'Groups',
      kind: 'group',
      title: group.name,
      subtitle: `${group.mouse_ids.length} mice`,
      href: `/groups/${group.id}`,
      image: mouseGroupImageUrl(group.id),
      keywords: `${group.name} ${group.description_short ?? ''} group mice clan tribe`.toLowerCase(),
    });
  }

  for (const region of getLocations()) {
    records.push({
      id: `region-${region.id}`,
      group: 'Locations',
      kind: 'location',
      title: region.name,
      subtitle: `Region · ${region.locations.length} locations`,
      href: `/regions/${region.id}`,
      keywords: `${region.name} region ${region.locations.map((location) => location.name).join(' ')}`.toLowerCase(),
    });
  }

  const envByName = new Map(getEnvironments().map((env) => [env.name, env]));
  for (const region of getLocations()) {
    for (const location of region.locations) {
      const env = envByName.get(location.name);
      records.push({
        id: `location-${location.id}`,
        group: 'Locations',
        kind: 'location',
        title: location.name,
        subtitle: region.name,
        href: `/locations/${location.id}`,
        image: locationImageUrl(location.id),
        keywords: `${location.name} ${region.name} ${env?.description ?? ''} location area region`.toLowerCase(),
      });
    }
  }

  for (const item of getResources()) {
    const isGuide = item.category === 'guide';
    // Userscripts always resolve to their on-site detail page, like the Item card.
    const href = item.category === 'userscript' ? `/userscripts/${item.id}` : item.url;
    records.push({
      id: `item-${item.category}-${item.id}`,
      group: isGuide ? 'Guides' : 'Resources',
      kind: item.category as SearchKind,
      title: item.name,
      subtitle: isGuide ? 'Guide' : capitalize(item.category),
      href,
      external: /^https?:/i.test(href),
      keywords:
        `${item.name} ${item.description} ${item.category} ${item.source ?? ''} ${(item.tags ?? []).join(' ')}`.toLowerCase(),
    });
  }

  for (const title of getTitles()) {
    records.push({
      id: `title-${title.id}`,
      group: 'Titles',
      kind: 'title',
      title: title.name,
      subtitle: 'Rank',
      href: '/titles',
      image: titleImageUrl(title.id),
      keywords: `${title.name} title rank wisdom`.toLowerCase(),
    });
  }

  staticRecords = records;
  return records;
}

/** Everyday words for the game's item classifications ("bait" is what hunters call cheese). */
const CLASSIFICATION_TERMS: Record<string, string> = {
  bait: 'cheese',
  weapon: 'trap',
  trinket: 'charm',
  convertible: 'chest box bundle open',
  skin: 'trap skin',
};

function toGameItemRecord(item: IndexedItem): SearchRecord {
  return {
    id: `gameitem-${item.id}`,
    group: 'Items',
    kind: 'item',
    title: item.name,
    subtitle: classificationName(item.classification),
    href: `/items/${item.type.replaceAll('_', '-')}`,
    image: itemImageUrl(item.type),
    keywords:
      `${item.name} ${item.classification} ${CLASSIFICATION_TERMS[item.classification] ?? ''} ${(item.tags ?? []).join(' ')} item`.toLowerCase(),
  };
}

/**
 * Game items and mice are numerous, so their indexes load lazily on first
 * search — from the same shared chunks the /items and /mice
 * browsers use, so whichever comes first pays for both.
 */
export function loadGameItemRecords(): Promise<SearchRecord[]> {
  return loadItemIndex().then((items) => items.map(toGameItemRecord));
}

export function loadMouseRecords(): Promise<SearchRecord[]> {
  return loadMouseIndex().then((mice) => mice.map(toMouseRecord));
}

/** Treat punctuation and accents as word separators so game typography remains searchable. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// Records never change once built, so normalize each one once rather than on
// every keystroke across thousands of records.
const normalizedRecords = new WeakMap<SearchRecord, { keywords: string; title: string; titleWords: string[] }>();

function normalizedRecord(record: SearchRecord) {
  let normalized = normalizedRecords.get(record);
  if (!normalized) {
    const title = normalizeSearchText(record.title);
    normalized = {
      // Leading space so word-start checks can look for " token".
      keywords: ` ${normalizeSearchText(`${record.title} ${record.keywords}`)}`,
      title,
      titleWords: title.split(' '),
    };
    normalizedRecords.set(record, normalized);
  }
  return normalized;
}

/** Words that say what kind of thing is wanted rather than what it's called. */
const KIND_WORDS: Record<string, SearchKind[]> = {
  mouse: ['mouse'],
  mice: ['mouse'],
  item: ['item'],
  items: ['item'],
  guide: ['guide'],
  guides: ['guide'],
  walkthrough: ['guide'],
  tutorial: ['guide'],
  spreadsheet: ['spreadsheet'],
  spreadsheets: ['spreadsheet'],
  sheet: ['spreadsheet'],
  sheets: ['spreadsheet'],
  tool: ['tool', 'page'],
  tools: ['tool', 'page'],
  calculator: ['tool', 'page'],
  extension: ['extension'],
  extensions: ['extension'],
  addon: ['extension'],
  script: ['userscript'],
  scripts: ['userscript'],
  userscript: ['userscript'],
  userscripts: ['userscript'],
  location: ['location'],
  area: ['location'],
  group: ['group'],
  title: ['title'],
  rank: ['title'],
};

/**
 * Other ways hunters say the same thing. Matched at the start of a word, so a
 * short alternative like "basic" can't match inside an unrelated name.
 */
const SYNONYMS: Record<string, string[]> = {
  beginner: ['newbie', 'starter', 'starting', 'basic', 'essential', 'novice', 'intro', 'getting started', 'new player'],
  newbie: ['beginner', 'starter', 'basic', 'essential', 'novice', 'new player'],
  starter: ['beginner', 'starting', 'basic', 'essential', 'novice'],
  start: ['beginner', 'starting', 'basic', 'essential'],
  basic: ['beginner', 'essential', 'novice'],
  basics: ['beginner', 'essential', 'novice'],
  returning: ['return', 'returner', 'comeback'],
  progression: ['progress', 'upgrade', 'route'],
  calc: ['calculator', 'estimator'],
  calculator: ['estimator', 'simulator'],
  map: ['treasure map', 'mapping', 'scroll case'],
  luck: ['minluck'],
  // Community shorthand.
  sb: ['super brie'],
  vr: ['valour rift'],
  fi: ['floating islands'],
  lab: ['labyrinth'],
  gwh: ['great winter hunt'],
  bwr: ['bristle woods rift'],
  frox: ['fort rox'],
  zt: ['zugzwang'],
  tse: ['trap special effects'],
  rh: ['relic hunter'],
  uu: ['ultimate umbra'],
  uc: ['ultimate charm'],
  ml: ['minluck'],
  cre: ['catch rate estimator'],
  mhct: ['mousehunt community tools'],
};

/** Whole phrases that mean something simpler; applied before the query is split into words. */
const PHRASES: [RegExp, string][] = [
  // Someone saying they're new wants a guide, not the "Beginner's Luck" item.
  [/\b(new|newer|first time|fresh) (player|hunter)s?\b/g, 'beginner guide'],
  [/\b(getting|get|just) started\b/g, 'beginner guide'],
  [/\b(how|where) (to|do i) start\b/g, 'beginner guide'],
  [/\bcoming back\b/g, 'returning'],
];

const STOPWORDS = new Set(['a', 'an', 'the', 'for', 'to', 'of', 'in', 'on', 'and', 'how', 'what', 'where', 'is', 'my']);

/** A query word, plus the alternatives that also satisfy it. */
interface QueryToken {
  text: string;
  alternatives: string[];
}

function stem(token: string): string {
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

/** Levenshtein distance, giving up once it exceeds `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > max) return max + 1;
    previous = current;
  }
  return previous[b.length];
}

type Match = 'literal' | 'synonym' | 'fuzzy';

function matchToken(token: QueryToken, record: ReturnType<typeof normalizedRecord>): Match | null {
  // Short words ("sb", "vr") only count at the start of a word, or "sb" would match "crossbow".
  if (record.keywords.includes(token.text.length <= 3 ? ` ${token.text}` : token.text)) return 'literal';
  for (const alternative of token.alternatives) {
    if (record.keywords.includes(` ${alternative}`)) return 'synonym';
  }
  // Typos: only on longer words, and only against the name, to keep noise down.
  if (token.text.length >= 5) {
    const max = token.text.length >= 8 ? 2 : 1;
    for (const word of record.titleWords) {
      if (word.length >= 4 && editDistance(token.text, word.slice(0, token.text.length + max), max) <= max) {
        return 'fuzzy';
      }
    }
  }
  return null;
}

// A small lean towards the things people search for most when matches tie.
const KIND_PRIOR: Partial<Record<SearchKind, number>> = {
  mouse: 30,
  page: 25,
  guide: 20,
  location: 20,
  item: 10,
};

/**
 * Every content word must match (literally, through a synonym, or within a typo
 * or two); words like "guide" or "mouse" steer towards that kind instead of
 * having to appear. Results come back best first.
 */
export function searchRecords(records: SearchRecord[], query: string, limit = 40): SearchRecord[] {
  let q = normalizeSearchText(query);
  if (!q) return [];
  for (const [pattern, replacement] of PHRASES) q = q.replace(pattern, replacement);

  const words = q.split(' ').filter(Boolean);
  const contentWords = words.filter((word) => !STOPWORDS.has(word));
  const kindWords = contentWords.filter((word) => KIND_WORDS[word]);
  const nameWords = contentWords.filter((word) => !KIND_WORDS[word]);
  // "spreadsheets" alone is a search for that page, not a filter with nothing to filter.
  const required = (nameWords.length > 0 ? nameWords : contentWords.length > 0 ? contentWords : words).map(
    (text): QueryToken => {
      const stemmed = stem(text);
      return { text: stemmed, alternatives: [...(SYNONYMS[text] ?? []), ...(SYNONYMS[stemmed] ?? [])] };
    },
  );
  const wantedKinds = new Set(nameWords.length > 0 ? kindWords.flatMap((word) => KIND_WORDS[word]) : []);
  const nameQuery = nameWords.length > 0 ? nameWords.join(' ') : q;

  const scored: { record: SearchRecord; score: number }[] = [];

  for (const record of records) {
    const normalized = normalizedRecord(record);
    let score = 0;
    let matchesAll = true;
    for (const token of required) {
      const match = matchToken(token, normalized);
      if (!match) {
        matchesAll = false;
        break;
      }
      if (match === 'literal') {
        if (normalized.title.startsWith(token.text)) score += 40;
        else if (normalized.titleWords.some((word) => word.startsWith(token.text))) score += 30;
        else if (normalized.title.includes(token.text)) score += 20;
      } else if (match === 'synonym') {
        // "beginner" finding the Essentials guide by its name beats finding a passing mention.
        const inTitle = token.alternatives.some((alternative) => ` ${normalized.title}`.includes(` ${alternative}`));
        score += inTitle ? 60 : 10;
      }
    }
    if (!matchesAll) continue;

    const { title } = normalized;
    if (title === q || title === nameQuery) score += 1000;
    else if (title.startsWith(q) || title.startsWith(nameQuery)) score += 600;
    else if (title.includes(nameQuery)) score += 300;

    // Asking for a kind ("… guide") outranks a name that merely starts the same way.
    if (wantedKinds.has(record.kind)) score += 1500;
    score += KIND_PRIOR[record.kind] ?? 0;

    scored.push({ record, score });
  }

  scored.sort((a, b) => b.score - a.score || a.record.title.length - b.record.title.length);
  if (scored.length <= limit) return scored.map((entry) => entry.record);

  // Keep broad item/mouse matches from consuming the whole result budget: two
  // slots per matching group first, then the strongest matches overall.
  const selected = new Set<SearchRecord>();
  for (const group of GROUP_ORDER) {
    let reserved = 0;
    for (const entry of scored) {
      if (selected.size >= limit || reserved >= 2) break;
      if (entry.record.group !== group) continue;
      selected.add(entry.record);
      reserved++;
    }
  }
  for (const entry of scored) {
    if (selected.size >= limit) break;
    selected.add(entry.record);
  }

  return scored.filter((entry) => selected.has(entry.record)).map((entry) => entry.record);
}
