import React from 'react';

import { SparklesIcon } from '@heroicons/react/20/solid';
import { Link } from '@/components/link';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';

import { getLocations, getTrapEffects } from '@/data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'Location-Specific Trap & Base Effects',
  description:
    'Which traps, bases, and charms have special effects in each MouseHunt location — bonus loot, instacatches, attraction tweaks, and more.',
  path: '/trap-special-effects',
});

export default function TrapSpecialEffectsPage() {
  const trapEffects = getTrapEffects().filter((entry) => entry.effects.length > 0);

  // Map location display names to our on-site location pages where they match.
  const locationIdByName = new Map<string, string>();
  for (const region of getLocations()) {
    for (const location of region.locations) {
      locationIdByName.set(location.name.toLowerCase(), location.id.toString());
    }
  }

  // Group locations by region, preserving the spreadsheet's order.
  const regions: { region: string; entries: typeof trapEffects }[] = [];
  for (const entry of trapEffects) {
    let group = regions.find((r) => r.region === entry.region);
    if (!group) {
      group = { region: entry.region, entries: [] };
      regions.push(group);
    }
    group.entries.push(entry);
  }

  return (
    <div>
      <PageHeader
        title="Location trap &amp; base effects"
        description={
          <>
            Traps, bases, and charms with special effects that only apply in certain locations — bonus loot,
            instacatches, attraction tweaks, and more. Adapted from the community{' '}
            <PageLink href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRg_s_It1mDCefWgwc-7Gexr5Hc7lKBztFue9kYZidI76iodSUan3BoGsagLCI1M26U_zG7uVMe9kgK/pubhtml?gid=0&single=true">
              Location Specific Trap Effects
            </PageLink>{' '}
            spreadsheet.
          </>
        }
        icon={SparklesIcon}
        iconClassName="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      />

      <div className="space-y-12">
        {regions.map(({ region, entries }) => (
          <section key={region}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              {region}
            </h2>
            <div className="mt-4 space-y-6">
              {entries.map((entry) => {
                const locationId = locationIdByName.get(entry.location.toLowerCase());
                return (
                  <div
                    key={`${region}-${entry.location}`}
                    className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                      {locationId ? (
                        <Link
                          href={`/locations/${locationId}`}
                          className="transition-colors hover:text-green-700 dark:hover:text-green-300"
                        >
                          {entry.location}
                        </Link>
                      ) : (
                        entry.location
                      )}
                    </h3>
                    <dl className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                      {entry.effects.map((effect) => (
                        <div
                          key={`${entry.location}-${effect.name}-${effect.effect}`}
                          className="grid grid-cols-1 gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr]"
                        >
                          <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{effect.name}</dt>
                          <dd className="text-sm text-zinc-600 dark:text-zinc-400">{effect.effect || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
