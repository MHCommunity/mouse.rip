import React from 'react';

import { WrenchIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';
import { SectionHeading } from '@/components/section-heading';
import { ToolCard, type Tint } from '@/components/tool-card';

import { itemImageUrl, locationImageUrl, mouseImageUrl, titleImageUrl } from '@/lib/image-urls';
import { getResourcesByCategory } from '@/lib/site-data';
import { pageMetadata } from '@/seo';
import { isInternalPath } from '@/utils';

export const metadata = pageMetadata({
  title: 'MouseHunt Tools',
  description: 'MouseHunt calculators, simulators, and lookups for catch rates, minlucks, and Marketplace prices.',
  path: '/tools',
});

/** The site's own tools, sorted by what a hunter is trying to do, each with a piece of the game's art. */
const GROUPS: { id: string; title: string; blurb: string; tools: { id: string; image: string; tint: Tint }[] }[] = [
  {
    id: 'plan',
    title: 'Plan a hunt',
    blurb: 'Where to go next, and what to bring.',
    tools: [
      { id: 'catch-rates', image: itemImageUrl('acronym_weapon'), tint: 'pink' },
      { id: 'best-setup', image: itemImageUrl('infinite_dark_magic_mirror_weapon'), tint: 'violet' },
      { id: 'map-planner', image: itemImageUrl('treasure_map_scroll_case_convertible'), tint: 'amber' },
    ],
  },
  {
    id: 'numbers',
    title: 'Work it out',
    blurb: 'Quick sums so you don’t need a spreadsheet.',
    tools: [
      { id: 'rank-up-calculator', image: titleImageUrl('baron_baroness'), tint: 'pink' },
      { id: 'essence-calculator', image: '/images/essence/icuri.png', tint: 'violet' },
      { id: 'queso-pump-calculator', image: itemImageUrl('queso_pump_egg_convertible'), tint: 'amber' },
    ],
  },
  {
    id: 'lookup',
    title: 'Look it up',
    blurb: 'The numbers and places hunters ask about most.',
    tools: [
      { id: 'minlucks', image: '/images/stats/luck.png', tint: 'green' },
      { id: 'trap-special-effects', image: itemImageUrl('chrome_acronym_weapon'), tint: 'sky' },
      { id: 'relic-hunter', image: mouseImageUrl('relic_hunter'), tint: 'violet' },
      { id: 'valour-rift-floors', image: locationImageUrl('valour-rift'), tint: 'sky' },
      { id: 'titles', image: titleImageUrl('fabled'), tint: 'pink' },
    ],
  },
];

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function Tools() {
  const items = getResourcesByCategory('tool');
  // On-site tools only, so a grouped tool that moves to another site shows once, under the off-site list.
  const byId = new Map(items.filter((item) => isInternalPath(item.url)).map((item) => [String(item.id), item]));
  const grouped = new Set(GROUPS.flatMap((group) => group.tools.map((tool) => tool.id)));
  // A tool on the site that hasn't been given a group yet still shows, rather than going missing.
  const ungrouped = items.filter((item) => isInternalPath(item.url) && !grouped.has(String(item.id)));
  const elsewhere = items.filter((item) => !isInternalPath(item.url));

  return (
    <div className="warm">
      <PageHeader
        title="MouseHunt tools"
        description="Calculators and lookups for planning your next hunt. The ones here run right on mouse.rip, and below them are the community’s favourites on other sites."
        count={items.length}
        countLabel="tools"
        icon={WrenchIcon}
        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      />

      {GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`tools-${group.id}`} className="mt-10 first-of-type:mt-0">
          <SectionHeading id={`tools-${group.id}`} className="text-lg/7">
            {group.title}
          </SectionHeading>
          <p className="mt-1 text-sm/6 text-zinc-600 dark:text-zinc-400">{group.blurb}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.tools.flatMap((tool) => {
              const item = byId.get(tool.id);
              if (!item) return [];
              return (
                <li key={tool.id}>
                  <ToolCard
                    href={item.url}
                    title={item.name}
                    description={item.description}
                    image={tool.image}
                    tint={tool.tint}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {ungrouped.length > 0 && (
        <section aria-labelledby="tools-more" className="mt-10">
          <SectionHeading id="tools-more" className="text-lg/7">
            More on mouse.rip
          </SectionHeading>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ungrouped.map((item) => (
              <li key={item.id}>
                <ToolCard href={item.url} title={item.name} description={item.description} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {elsewhere.length > 0 && (
        <section
          aria-labelledby="tools-elsewhere"
          className="mt-12 rounded-3xl bg-zinc-50 p-5 ring-1 ring-zinc-200/70 sm:p-6 dark:bg-white/[0.03] dark:ring-zinc-800"
        >
          <SectionHeading id="tools-elsewhere" className="text-lg/7">
            Community favourites on other sites
          </SectionHeading>
          <p className="mt-1 text-sm/6 text-zinc-600 dark:text-zinc-400">
            Built and run by other hunters. These open in a new tab.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {elsewhere.map((item) => (
              <li key={item.id}>
                <ToolCard
                  href={item.url}
                  title={item.name}
                  description={item.description}
                  external={item.source ?? hostnameOf(item.url)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
