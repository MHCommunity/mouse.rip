import clsx from 'clsx';
import React from 'react';

import { CheeseCell, LocationCell } from '@/components/mhct-cells';
import type { AttractionRow, MouseMapRow } from '@/types';
import { formatCompactNumber, formatNumber } from '@/utils';
import { SectionHeading } from '@/components/section-heading';
import { SourceLink } from '@/components/source-link';
import { bestAttractionRow, formatAttractionRate } from '@/lib/attraction';

// Rows shown before "Show all", so the long tail doesn't bury the sections below.
const ATTRACTION_PREVIEW = 10;
const ATTRACTION_LIMIT = 50;
const MAPS_PREVIEW = 10;
const MAPS_LIMIT = 40;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Elite Map (-09.2022)" is the version retired in September 2022: say so in words. */
export function mapName(name: string): string {
  return name
    .replace(
      /\(-(\d{2})\.(\d{4})\)$/,
      (_, month: string, year: string) => `(until ${MONTHS[Number(month) - 1] ?? month} ${year})`,
    )
    .replace(/\(-(\d{4})\)$/, '(until $1)');
}

/**
 * Reveals the rows past the preview. "Show all" when that's everything; when the list is capped,
 * "Show N more", with the cap spelled out once it's open.
 */
function ShowAll({
  more,
  shown,
  total,
  children,
}: {
  /** Rows the disclosure adds. */
  more: number;
  /** Rows on the page once it's open. */
  shown: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <details className="group mt-2">
      <summary className="inline-flex min-h-9 cursor-pointer items-center rounded-md px-1 text-sm font-medium text-pink-700 hover:text-pink-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300 dark:hover:text-pink-200">
        <span className="group-open:hidden">
          {shown === total ? `Show all ${formatNumber(total)}` : `Show ${formatNumber(more)} more`}
        </span>
        <span className="hidden group-open:inline">Show fewer</span>
      </summary>
      <div className="mt-2">{children}</div>
      {shown < total && (
        <p className="mt-2 px-1 text-sm text-zinc-600 dark:text-zinc-400">
          Showing the top {formatNumber(shown)} of {formatNumber(total)}.
        </p>
      )}
    </details>
  );
}

function AttractionTable({
  rows,
  showLocation,
  showCheese,
}: {
  rows: AttractionRow[];
  showLocation: boolean;
  showCheese: boolean;
}) {
  // Most mice are only attracted in one place, often only with a charm; columns
  // that would repeat on every row, or stay empty on every row, are left out.
  const showCharm = rows.some((row) => row.charm);
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
          <tr>
            {showLocation && <th className="px-3 py-2 font-medium sm:px-4">Location</th>}
            {showCheese && <th className="px-3 py-2 font-medium sm:px-4">Cheese</th>}
            {showCharm && (
              <th className={clsx('px-3 py-2 font-medium sm:px-4', showCheese && 'hidden sm:table-cell')}>Charm</th>
            )}
            <th className="px-3 py-2 text-right font-medium sm:px-4">Rate</th>
            <th className="hidden px-3 py-2 text-right font-medium sm:table-cell sm:px-4">Sample</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row, index) => (
            <tr key={`${row.location}-${row.stage}-${row.cheese}-${row.charm}-${index}`}>
              {showLocation && (
                <td className="px-3 py-2 align-top sm:px-4">
                  <LocationCell location={row.location} stage={row.stage} />
                </td>
              )}
              {showCheese && (
                <td className="px-3 py-2 align-top sm:px-4">
                  <CheeseCell cheese={row.cheese} />
                  {!showLocation && row.stage && (
                    <span className="text-zinc-600 dark:text-zinc-400"> ({row.stage})</span>
                  )}
                  {/* On phones the Charm column is hidden, so the charm rides under the cheese. */}
                  {row.charm && (
                    <span className="block text-xs text-zinc-600 sm:hidden dark:text-zinc-400">with {row.charm}</span>
                  )}
                </td>
              )}
              {showCharm && (
                <td
                  className={clsx(
                    'px-3 py-2 align-top text-zinc-700 sm:px-4 dark:text-zinc-300',
                    showCheese && 'hidden sm:table-cell',
                  )}
                >
                  {row.charm ?? <span className="text-zinc-500 dark:text-zinc-400">None</span>}
                </td>
              )}
              <td className="px-3 py-2 text-right align-top font-medium tabular-nums text-zinc-900 sm:px-4 dark:text-white">
                {formatAttractionRate(row.rate)}
                {/* On phones the Sample column is hidden, so the sample rides under the rate. */}
                <span className="block text-xs font-normal whitespace-nowrap text-zinc-600 sm:hidden dark:text-zinc-400">
                  {row.total_hunts ? `${formatCompactNumber(row.total_hunts)} hunts` : 'MH-Tools'}
                </span>
              </td>
              <td className="hidden px-3 py-2 text-right align-top tabular-nums text-zinc-600 sm:table-cell sm:px-4 dark:text-zinc-400">
                {/* MH-Tools rows come without a hunt count. */}
                {row.total_hunts ? (
                  formatNumber(row.total_hunts)
                ) : (
                  <span title="MH-Tools rates don't say how many hunts they come from">—</span>
                )}
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
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-zinc-700 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800"
          title={`On ${formatNumber(row.seen_maps)} of ${formatNumber(row.total_maps)} maps`}
        >
          {mapName(row.map)}
          <span className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
            {formatAttractionRate(row.rate)}
            <span className="sr-only">
              , on {formatNumber(row.seen_maps)} of {formatNumber(row.total_maps)} maps
            </span>
          </span>
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
  // The row the summary above calls best always makes the preview, in rate order,
  // even when charm rows outrank it.
  const best = bestAttractionRow(attractionRows);
  const preview = attractionRows.slice(0, ATTRACTION_PREVIEW);
  if (best && !preview.includes(best)) preview.splice(ATTRACTION_PREVIEW - 1, 1, best);
  const rest = attractionRows.filter((row) => !preview.includes(row));
  const locations = new Set(attractionRows.map((row) => row.location));
  const onlyLocation = locations.size === 1 ? attractionRows[0].location : null;
  // A stage rides beside the cheese, so the cheese column only folds away without one.
  const cheeses = new Set(attractionRows.map((row) => row.cheese));
  const onlyCheese = cheeses.size === 1 && attractionRows.every((row) => !row.stage) ? attractionRows[0].cheese : null;
  const mapRows = maps.slice(0, MAPS_LIMIT);

  return (
    <div className="mt-10 space-y-10">
      <section>
        <SectionHeading>Where to find it</SectionHeading>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {onlyLocation && (
            <>
              Only in <LocationCell location={onlyLocation} />
              {onlyCheese && (
                <>
                  {' '}
                  with <CheeseCell cheese={onlyCheese} />
                </>
              )}
              .{' '}
            </>
          )}
          {!onlyLocation && onlyCheese && (
            <>
              Only with <CheeseCell cheese={onlyCheese} />.{' '}
            </>
          )}
          From <SourceLink source="mhct" /> and <SourceLink source="mh-tools" />.
          {attractionRows.some((row) => row.charm) && attractionRows.some((row) => !row.charm) && (
            <> A row that names a charm is the rate with that charm armed, which can be higher than without one.</>
          )}
        </p>

        {attraction.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No attraction data recorded for this mouse yet.
          </p>
        ) : (
          <>
            <div className="mt-4">
              <AttractionTable rows={preview} showLocation={!onlyLocation} showCheese={!onlyCheese} />
            </div>
            {rest.length > 0 && (
              <ShowAll more={rest.length} shown={attractionRows.length} total={attraction.length}>
                <AttractionTable rows={rest} showLocation={!onlyLocation} showCheese={!onlyCheese} />
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
            <ShowAll more={mapRows.length - MAPS_PREVIEW} shown={mapRows.length} total={maps.length}>
              <MapChips rows={mapRows.slice(MAPS_PREVIEW)} />
            </ShowAll>
          )}
        </section>
      )}
    </div>
  );
}
