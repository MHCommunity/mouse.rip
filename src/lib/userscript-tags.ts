/** Userscript tags are short ids ("seh", "ui"); these are the names hunters know them by. */
const TAG_NAMES: Record<string, string> = {
  ui: 'Interface',
  location: 'Locations',
  stats: 'Stats',
  event: 'Events',
  calculator: 'Calculators',
  seh: 'Spring Egg Hunt',
  gwh: 'Great Winter Hunt',
  maps: 'Maps',
  hunting: 'Hunting',
  items: 'Items',
  marketplace: 'Marketplace',
  wisdom: 'Wisdom',
  travel: 'Travel',
  halloween: 'Halloween',
  journal: 'Journal',
  fun: 'Just for fun',
};

export function userscriptTagName(tag: string): string {
  return TAG_NAMES[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1);
}

/** Every tag with how many scripts carry it, most used first. */
export function userscriptTagCounts(scripts: { tags?: string[] }[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const script of scripts) {
    for (const tag of new Set(script.tags ?? [])) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || userscriptTagName(a.tag).localeCompare(userscriptTagName(b.tag)));
}
