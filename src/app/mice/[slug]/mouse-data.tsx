import React from 'react';

import { CheeseCell, LocationCell } from '@/components/mhct-cells';
import { sectionTitle } from '@/components/live-data';
import type { AttractionRow, MouseMapRow } from '@/types';
import { formatNumber } from '@/utils';

/** MHCT reports rates in hundredths of a percent. */
function formatRate(rate: number): string {
  return `${(rate / 100).toFixed(2)}%`;
}

/**
 * Attraction and map tables. Both datasets are baked in at build time (see
 * scripts/update-data.js), so this renders on the server — no fetch, no
 * skeleton, and the tables are in the HTML for crawlers.
 */
export function MouseData({ attraction, maps }: { attraction: AttractionRow[]; maps: MouseMapRow[] }) {
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

        {attraction.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No attraction data recorded for this mouse yet.
          </p>
        ) : (
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
                {attraction.slice(0, 50).map((row, index) => (
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
                      {formatNumber(row.total_hunts)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {maps.length > 0 && (
        <section>
          <h2 className={sectionTitle}>Found on maps</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {maps.slice(0, 40).map((row) => (
              <span
                key={row.map}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                title={`Appears on ${formatNumber(row.seen_maps)} of ${formatNumber(row.total_maps)} of these maps`}
              >
                {row.map}
                <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{formatRate(row.rate)}</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
