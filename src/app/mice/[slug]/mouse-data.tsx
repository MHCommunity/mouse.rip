import React from 'react';

import { CheeseCell, LocationCell } from '@/components/mhct-cells';
import type { AttractionRow, MouseMapRow } from '@/types';
import { formatCompactNumber, formatNumber } from '@/utils';
import { SectionHeading } from '@/components/section-heading';
import { SourceLink } from '@/components/source-link';

// Rows shown before "Show all", so the long tail doesn't bury the sections below.
const ATTRACTION_PREVIEW = 10;
const ATTRACTION_LIMIT = 50;
const MAPS_PREVIEW = 10;
const MAPS_LIMIT = 40;

/** MHCT reports rates in hundredths of a percent. */
function formatRate(rate: number): string {
  return `${(rate / 100).toFixed(2)}%`;
}

function ShowAll({ shown, total, children }: { shown: number; total: number; children: React.ReactNode }) {
  return (
    <details className="group mt-2">
      <summary className="inline-flex min-h-9 cursor-pointer items-center rounded-md px-1 text-sm font-medium text-pink-700 hover:text-pink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300 dark:hover:text-pink-200">
        <span className="group-open:hidden">
          {shown === total
            ? `Show all ${formatNumber(total)}`
            : `Show ${formatNumber(shown)} of ${formatNumber(total)}`}
        </span>
        <span className="hidden group-open:inline">Show fewer</span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

function AttractionTable({ rows }: { rows: AttractionRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2 font-medium sm:px-4">Location</th>
            <th className="px-3 py-2 font-medium sm:px-4">Cheese</th>
            <th className="px-3 py-2 text-right font-medium sm:px-4">Rate</th>
            <th className="hidden px-3 py-2 text-right font-medium sm:table-cell sm:px-4">Sample</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row, index) => (
            <tr key={`${row.location}-${row.stage}-${row.cheese}-${row.charm}-${index}`}>
              <td className="px-3 py-2 align-top sm:px-4">
                <LocationCell location={row.location} stage={row.stage} />
              </td>
              <td className="px-3 py-2 align-top sm:px-4">
                <CheeseCell cheese={row.cheese} />
                {row.charm && <span className="text-zinc-600 dark:text-zinc-400"> · {row.charm}</span>}
              </td>
              <td className="px-3 py-2 text-right align-top font-medium tabular-nums text-zinc-900 sm:px-4 dark:text-white">
                {formatRate(row.rate)}
                {/* On phones the Sample column is hidden, so the sample rides under the rate. */}
                <span className="block text-xs font-normal whitespace-nowrap text-zinc-600 sm:hidden dark:text-zinc-400">
                  {row.total_hunts ? `${formatCompactNumber(row.total_hunts)} hunts` : '—'}
                </span>
              </td>
              <td className="hidden px-3 py-2 text-right align-top tabular-nums text-zinc-600 sm:table-cell sm:px-4 dark:text-zinc-400">
                {row.total_hunts ? formatNumber(row.total_hunts) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MapChips({ rows }: { rows: MouseMapRow[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {rows.map((row) => (
        <li
          key={row.map}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          title={`On ${formatNumber(row.seen_maps)} of ${formatNumber(row.total_maps)} maps`}
        >
          {row.map}
          <span className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">{formatRate(row.rate)}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Attraction and map tables. Both datasets are baked in at build time (see
 * scripts/update-data.js), so this renders on the server — no fetch, no
 * skeleton, and the tables are in the HTML for crawlers.
 */
export function MouseData({ attraction, maps }: { attraction: AttractionRow[]; maps: MouseMapRow[] }) {
  const attractionRows = attraction.slice(0, ATTRACTION_LIMIT);
  const mapRows = maps.slice(0, MAPS_LIMIT);

  return (
    <div className="mt-10 space-y-10">
      <section>
        <SectionHeading>Where to find it</SectionHeading>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          From <SourceLink source="mhct" /> and <SourceLink source="mh-tools" />.
        </p>

        {attraction.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No attraction data recorded for this mouse yet.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <AttractionTable rows={attractionRows.slice(0, ATTRACTION_PREVIEW)} />
            </div>
            {attractionRows.length > ATTRACTION_PREVIEW && (
              <ShowAll shown={attractionRows.length} total={attraction.length}>
                <AttractionTable rows={attractionRows.slice(ATTRACTION_PREVIEW)} />
              </ShowAll>
            )}
          </>
        )}
      </section>

      {maps.length > 0 && (
        <section>
          <SectionHeading>Found on maps</SectionHeading>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            The share of each map type that included this mouse, from <SourceLink source="mhct" />.
          </p>
          <div className="mt-4">
            <MapChips rows={mapRows.slice(0, MAPS_PREVIEW)} />
          </div>
          {mapRows.length > MAPS_PREVIEW && (
            <ShowAll shown={mapRows.length} total={maps.length}>
              <MapChips rows={mapRows.slice(MAPS_PREVIEW)} />
            </ShowAll>
          )}
        </section>
      )}
    </div>
  );
}
