import React from 'react';

import { MapPinIcon } from '@heroicons/react/20/solid';
import { Link } from '@/components/link';
import { PageHeader } from '@/components/page-header';

import { getEnvironments, getLocations, getRelicHunterHints } from '@/data';
import { RelicHunterLive } from './relic-hunter-live';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'Relic Hunter Location & Hints',
  description:
    "See where the Relic Hunter is hiding right now, plus the riddles she drops for every location she visits across MouseHunt.",
  path: '/relic-hunter',
});

export default function RelicHunterPage() {
  const hints = getRelicHunterHints();
  const environments = getEnvironments();

  const nameById = new Map(environments.map((env) => [env.id, env.name ?? env.id]));
  const imageById = new Map(environments.map((env) => [env.id, env.image]));
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
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Relic Hunter"
        description="Each day the Relic Hunter slips away to a new corner of the kingdom and leaves behind a riddle about where she's gone. See where she's hiding right now, and browse the riddles she drops for every location below."
        icon={MapPinIcon}
        iconClassName="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
      />

      <RelicHunterLive />

      <h2 className="mt-12 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
        Riddles by location
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
        Match the riddle she&rsquo;s giving to a location below to track her down.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map(([envId, list]) => {
          const name = nameById.get(envId) ?? envId;
          const image = imageById.get(envId);
          const locationId = envId.replace(/_/g, '-');
          const hasPage = locationIds.has(locationId);

          return (
            <div
              key={envId}
              className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt=""
                    className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {hasPage ? (
                      <Link
                        href={`/locations/${locationId}`}
                        className="transition-colors hover:text-rose-700 dark:hover:text-rose-300"
                      >
                        {name}
                      </Link>
                    ) : (
                      name
                    )}
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {list.length} {list.length === 1 ? 'riddle' : 'riddles'}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {list.map((hint) => (
                  <li
                    key={hint}
                    className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-pretty text-zinc-600 italic ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:text-zinc-300 dark:ring-white/5"
                  >
                    “{hint}”
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
