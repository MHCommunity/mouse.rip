import React from 'react';

import { MapPinIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';

import { getEnvironments, getLocations, getRelicHunterHints } from '@/lib/site-data';
import { RelicHunterLive } from './relic-hunter-live';
import { RiddleFinder } from './riddle-finder';
import { pageMetadata } from '@/seo';
import { SectionHeading } from '@/components/section-heading';

export const metadata = pageMetadata({
  title: 'Relic Hunter Location & Hints',
  description:
    'See where the Relic Hunter is hiding right now, plus the riddles she drops for every location she visits across MouseHunt.',
  path: '/relic-hunter',
});

export default function RelicHunterPage() {
  const hints = getRelicHunterHints();
  const environments = getEnvironments();

  const nameById = new Map(environments.map((env) => [env.id, env.name ?? env.id]));
  const orderById = new Map(environments.map((env) => [env.id, env.order ?? 999]));

  // On-site location ids (hyphenated) so we can link hint locations to their pages.
  const locationIds = new Set<string>();
  for (const region of getLocations()) {
    for (const location of region.locations) {
      locationIds.add(location.id.toString());
    }
  }

  const entries = Object.entries(hints)
    .filter(([, list]) => list.length > 0)
    .sort(([a], [b]) => (orderById.get(a) ?? 999) - (orderById.get(b) ?? 999));

  return (
    <div>
      <PageHeader
        title="Relic Hunter"
        description="Each day the Relic Hunter slips away to a new corner of the kingdom and leaves behind a riddle about where she's gone."
        icon={MapPinIcon}
        iconClassName="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
      />

      <RelicHunterLive />

      <SectionHeading className="mt-12">Riddles by location</SectionHeading>
      <RiddleFinder
        locations={entries.map(([envId, list]) => {
          const locationId = envId.replace(/_/g, '-');
          return {
            envId,
            name: nameById.get(envId) ?? envId,
            href: locationIds.has(locationId) ? `/locations/${locationId}` : null,
            hints: list,
          };
        })}
      />
    </div>
  );
}
