import React, { Suspense } from 'react';

import { MapIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';

import planner from '@/data/generated/map-planner.json';
import { locationImageUrl } from '@/lib/image-urls';
import { LOCATION_ALIASES, type Place } from '@/lib/map-plan';
import { getLocations } from '@/lib/site-data';
import { pageMetadata } from '@/seo';
import { MapPlanner, MapPlannerFromUrl } from './map-planner';

export const metadata = pageMetadata({
  title: 'MouseHunt Treasure Map Planner',
  description:
    'Paste the mice on your MouseHunt treasure map to see which locations and cheeses attract the most of them, from MHCT attraction rates.',
  path: '/map-planner',
});

export default function MapPlannerPage() {
  const pages = new Map(getLocations().flatMap((region) => region.locations.map((l) => [l.name, l.id] as const)));

  // Every location the planner can suggest, resolved to its page here. Anything without one is an event area.
  const places: Record<string, Place> = {};
  for (const name of planner.locations) {
    const id = pages.get(LOCATION_ALIASES[name] ?? name);
    places[name] = id ? { href: `/locations/${id}`, image: locationImageUrl(id) } : { event: true };
  }

  return (
    <div>
      <PageHeader
        title="Treasure map planner"
        description={
          <>
            Paste the mice still on your map to see which locations and cheeses attract the most of them. Attraction
            rates come from <PageLink href="https://www.mhct.win/">MHCT</PageLink>.
          </>
        }
        icon={MapIcon}
        iconClassName="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
      />
      {/* The planner reads ?mice= with useSearchParams, which needs a Suspense boundary to prerender. */}
      <Suspense fallback={<MapPlanner places={places} initialIds={[]} syncUrl={false} />}>
        <MapPlannerFromUrl places={places} />
      </Suspense>
    </div>
  );
}
