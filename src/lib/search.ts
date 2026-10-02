import { getItems, getLocations, getTitles, getEnvironments } from '@/data';
import { titleCase } from '@/utils';
import miceGroups from '@/data/generated/mice-groups.json';
import type { SlimMouse } from '@/types';
import { loadItemIndex, loadMouseIndex, type IndexedItem } from '@/lib/client-index';
import { itemImageUrl, locationImageUrl, mouseGroupImageUrl, mouseImageUrl, titleImageUrl } from '@/lib/image-urls';

export type SearchGroup = 'Pages' | 'Mice' | 'Groups' | 'Locations' | 'Items' | 'Guides' | 'Resources' | 'Titles';

export interface SearchRecord {
  id: string;
  group: SearchGroup;
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
  [
    '/marketplace',
    'Marketplace',
    'Live tradable item prices',
    'marketplace market prices gold sb supplies trade markethunt',
  ],
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
    'Trap Special Effects',
    'Location-specific trap effects',
    'trap special effects bonus location',
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
  title,
  subtitle,
  href,
  keywords: `${title} ${subtitle} ${keywords}`.toLowerCase(),
}));

const TYPE_LABELS: Record<string, string> = {
  arcane: 'Arcane',
  draconic: 'Draconic',
  forgotten: 'Forgotten',
  hydro: 'Hydro',
  physical: 'Physical',
  shadow: 'Shadow',
  tactical: 'Tactical',
  law: 'Law',
  rift: 'Rift',
};

function minluckSummary(mouse: SlimMouse): string | undefined {
  const entries = Object.entries(mouse.minlucks ?? {}).filter(
    ([, value]) => typeof value === 'number' && value > 0,
  ) as [string, number][];
  if (entries.length === 0) return undefined;

  const min = Math.min(...entries.map(([, value]) => value));
  const types = entries.filter(([, value]) => value === min).map(([type]) => TYPE_LABELS[type] ?? type);
  const label = types.length > 3 ? `${types.slice(0, 3).join(', ')} +${types.length - 3}` : types.join(', ');
  return `Minluck ${min} · ${label}`;
}

function toMouseRecord(mouse: SlimMouse): SearchRecord {
  const subtitle = [mouse.group, mouse.subgroup].filter(Boolean).join(' · ') || undefined;
  return {
    id: `mouse-${mouse.id}`,
    group: 'Mice',
    title: mouse.name,
    subtitle,
    badge: minluckSummary(mouse),
    href: `/mice/${mouse.type.replaceAll('_', '-')}`,
    image: mouseImageUrl(mouse.type),
    keywords:
      `${mouse.name} ${mouse.abbreviated_name ?? ''} ${mouse.group} ${mouse.subgroup ?? ''} mouse minluck`.toLowerCase(),
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
      title: group.name,
      subtitle: `${group.mouse_ids.length} mice`,
      href: `/groups/${group.id}`,
      image: mouseGroupImageUrl(group.id),
      keywords: `${group.name} ${group.description_short ?? ''} group mice clan tribe`.toLowerCase(),
    });
  }

  const envByName = new Map(getEnvironments().map((env) => [env.name, env]));
  for (const region of getLocations()) {
    for (const location of region.locations) {
      const env = envByName.get(location.name);
      records.push({
        id: `location-${location.id}`,
        group: 'Locations',
        title: location.name,
        subtitle: region.name,
        href: `/locations/${location.id}`,
        image: locationImageUrl(location.id),
        keywords: `${location.name} ${region.name} ${env?.description ?? ''} location area region`.toLowerCase(),
      });
    }
  }

  for (const item of getItems()) {
    const isGuide = item.category === 'guide';
    // Userscripts always resolve to their on-site detail page, like the Item card.
    const href = item.category === 'userscript' ? `/userscripts/${item.id}` : item.url;
    records.push({
      id: `item-${item.category}-${item.id}`,
      group: isGuide ? 'Guides' : 'Resources',
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

function toGameItemRecord(item: IndexedItem): SearchRecord {
  return {
    id: `gameitem-${item.id}`,
    group: 'Items',
    title: item.name,
    subtitle: titleCase(item.classification),
    href: `/items/${item.type.replaceAll('_', '-')}`,
    image: itemImageUrl(item.type),
    keywords: `${item.name} ${item.classification} item`.toLowerCase(),
  };
}

/**
 * Game items and mice are numerous, so their indexes load lazily on first
 * search — from the same shared chunks the /items, /mice and /marketplace
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

/** AND-match every token against keywords, then rank by how well the title matches. */
export function searchRecords(records: SearchRecord[], query: string, limit = 40): SearchRecord[] {
  const q = normalizeSearchText(query);
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { record: SearchRecord; score: number }[] = [];

  for (const record of records) {
    const keywords = normalizeSearchText(record.keywords);
    let matchesAll = true;
    for (const token of tokens) {
      if (!keywords.includes(token)) {
        matchesAll = false;
        break;
      }
    }
    if (!matchesAll) continue;

    const title = normalizeSearchText(record.title);
    let score = 0;
    if (title === q) score += 1000;
    else if (title.startsWith(q)) score += 600;
    else if (title.includes(q)) score += 300;

    for (const token of tokens) {
      if (title.startsWith(token)) score += 40;
      else if (title.includes(token)) score += 20;
    }

    scored.push({ record, score });
  }

  scored.sort((a, b) => b.score - a.score || a.record.title.length - b.record.title.length);
  if (scored.length <= limit) return scored.map((entry) => entry.record);

  // Keep broad item/mouse matches from consuming the entire result budget before
  // the dialog groups them. Two slots per matching group preserves navigation
  // results, then the remaining slots go to the strongest matches globally.
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
