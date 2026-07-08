'use client';

import React from 'react';

import { CheeseCell, LocationCell } from '@/components/mhct-cells';
import { useEndpoint, sectionTitle, SkeletonRows } from '@/components/live-data';

interface AttractionRow {
  location: string;
  stage: string | null;
  cheese: string;
  rate: number;
  total_hunts: number;
}

interface MapRow {
  map: string;
  rate: number;
  seen_maps: number;
  total_maps: number;
}

function formatRate(rate: number): string {
  return `${(rate / 100).toFixed(2)}%`;
}

export function MouseLiveData({ mouseId }: { mouseId: number }) {
  const attraction = useEndpoint<AttractionRow[]>(
    `https://api.mouse.rip/mhct/${mouseId}`,
    (data) => !Array.isArray(data) || data.length === 0
  );
  const maps = useEndpoint<MapRow[]>(
    `https://api.mouse.rip/maps-for-mouse/${mouseId}`,
    (data) => !Array.isArray(data) || data.length === 0
  );

  return (
    <div className="mt-10 space-y-10">
      <section>
        <h2 className={sectionTitle}>Where to find it</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Best attraction rates by location and cheese, from{' '}
          <a
            href="https://mhct.win"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            MHCT
          </a>
          .
        </p>

        {attraction.status === 'loading' && <SkeletonRows />}
        {attraction.status === 'error' && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Couldn&rsquo;t load attraction data right now.
          </p>
        )}
        {attraction.status === 'empty' && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No attraction data recorded for this mouse yet.
          </p>
        )}
        {attraction.status === 'ready' && (
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Location</th>
                  <th className="px-4 py-2 font-medium">Cheese</th>
                  <th className="px-4 py-2 text-right font-medium">Rate</th>
                  <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">Sample</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {attraction.data.slice(0, 50).map((row, index) => (
                  <tr key={`${row.location}-${row.stage}-${row.cheese}-${index}`}>
                    <td className="px-4 py-2">
                      <LocationCell location={row.location} stage={row.stage} />
                    </td>
                    <td className="px-4 py-2">
                      <CheeseCell cheese={row.cheese} />
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums text-zinc-900 dark:text-white">
                      {formatRate(row.rate)}
                    </td>
                    <td className="hidden px-4 py-2 text-right tabular-nums text-zinc-400 sm:table-cell dark:text-zinc-500">
                      {row.total_hunts.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className={sectionTitle}>Found on maps</h2>
        {maps.status === 'loading' && <SkeletonRows />}
        {maps.status === 'error' && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Couldn&rsquo;t load map data right now.
          </p>
        )}
        {maps.status === 'empty' && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            This mouse doesn&rsquo;t commonly appear on treasure maps.
          </p>
        )}
        {maps.status === 'ready' && (
          <div className="mt-4 flex flex-wrap gap-2">
            {maps.data.slice(0, 40).map((row) => (
              <span
                key={row.map}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                title={`Appears on ${row.seen_maps.toLocaleString()} of ${row.total_maps.toLocaleString()} of these maps`}
              >
                {row.map}
                <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                  {formatRate(row.rate)}
                </span>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
