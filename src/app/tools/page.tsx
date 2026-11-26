import React from 'react';

import { WrenchIcon } from '@heroicons/react/20/solid';
import { Breadcrumbs } from '@/components/breadcrumbs';
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

/** The site's own tools, in this order, each with a piece of the game's art. */
const ART: { id: string; image: string; tint: Tint }[] = [
  { id: 'catch-rates', image: itemImageUrl('acronym_weapon'), tint: 'pink' },
  { id: 'best-setup', image: itemImageUrl('infinite_dark_magic_mirror_weapon'), tint: 'violet' },
  { id: 'map-planner', image: itemImageUrl('treasure_map_scroll_case_convertible'), tint: 'amber' },
  { id: 'minlucks', image: '/images/stats/luck.png', tint: 'green' },
  { id: 'rank-up-calculator', image: titleImageUrl('baron_baroness'), tint: 'pink' },
  { id: 'relic-hunter', image: mouseImageUrl('relic_hunter'), tint: 'violet' },
  { id: 'valour-rift-floors', image: locationImageUrl('valour-rift'), tint: 'sky' },
  { id: 'trap-special-effects', image: itemImageUrl('chrome_acronym_weapon'), tint: 'sky' },
  { id: 'essence-calculator', image: '/images/essence/small/icuri.png', tint: 'violet' },
  { id: 'queso-pump-calculator', image: itemImageUrl('queso_pump_egg_convertible'), tint: 'amber' },
  { id: 'titles', image: titleImageUrl('fabled'), tint: 'pink' },
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
  const art = new Map(ART.map((entry, index) => [entry.id, { ...entry, index }]));
  // Ours in the order above, then any newer ones that haven't been given art yet.
  const onSite = items
    .filter((item) => isInternalPath(item.url))
    .sort((a, b) => (art.get(String(a.id))?.index ?? ART.length) - (art.get(String(b.id))?.index ?? ART.length));
  const elsewhere = items.filter((item) => !isInternalPath(item.url));

  return (
    <div>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Tools' }]} />
      <PageHeader
        title="MouseHunt tools"
        description="Calculators and lookups for planning your next hunt: our own first, then the community’s favorites on other sites."
        count={items.length}
        countLabel="tools"
        icon={WrenchIcon}
        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      />

      <section aria-labelledby="tools-here">
        <SectionHeading id="tools-here">On mouse.rip</SectionHeading>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {onSite.map((item) => {
            const entry = art.get(String(item.id));
            return (
              <li key={item.id}>
                <ToolCard
                  href={item.url}
                  title={item.name}
                  description={item.description}
                  image={entry?.image}
                  tint={entry?.tint}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {elsewhere.length > 0 && (
        <section
          aria-labelledby="tools-elsewhere"
          className="mt-12 rounded-3xl bg-zinc-50 p-5 ring-1 ring-zinc-200/70 sm:p-6 dark:bg-white/[0.03] dark:ring-zinc-800"
        >
          <SectionHeading id="tools-elsewhere">On other sites</SectionHeading>
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
