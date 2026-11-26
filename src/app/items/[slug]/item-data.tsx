import React from 'react';

import { Link } from 'next-view-transitions';

import { LocationCell } from '@/components/mhct-cells';
import type { ConvertibleRow, FoundInConvertible, ItemDropper, MapRelation } from '@/types';
import { formatCompactNumber, formatNumber } from '@/utils';
import { itemImageUrl } from '@/lib/image-urls';
import { ConvertibleContents } from './convertible-contents';
import { SectionHeading } from '@/components/section-heading';
import { SourceLink } from '@/components/source-link';
import { GameImage } from '@/components/game-image';

// Common items (Gold, SB+) come from hundreds of openables; listing them all
// makes the page several hundred KB.
// Shown before the "Show all" disclosure, so the ranked drop table isn't pushed down.
const FOUND_IN_PREVIEW = 8;
// Drop rows shown before "Show all"; the long tail is mostly tiny samples.
const DROPS_PREVIEW = 10;

function formatQuantity(min: number, max: number): string {
  if (!min && !max) return '';
  if (min === max) return `${min}`;
  return `${min}–${max}`;
}

function DropsTable({ rows }: { rows: ItemDropper[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-left text-xs text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2 font-medium sm:px-4">Mouse</th>
            <th className="px-3 py-2 font-medium sm:px-4">Location</th>
            <th className="hidden px-3 py-2 text-right font-medium sm:table-cell sm:px-4">Qty</th>
            <th className="py-2 pr-3 pl-1 text-right font-medium sm:px-4">
              <span className="sm:hidden">Rate</span>
              <span className="hidden sm:inline">Drop rate</span>
            </th>
            <th className="hidden px-3 py-2 text-right font-medium sm:table-cell sm:px-4">Sample</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row) => (
            <tr key={row.mouse_slug}>
              <td className="px-3 py-2 align-top sm:px-4">
                <Link
                  href={`/mice/${row.mouse_slug}`}
                  className="text-zinc-900 hover:text-pink-700 dark:text-white dark:hover:text-pink-300"
                >
                  {row.mouse_name}
                </Link>
              </td>
              <td className="px-3 py-2 align-top sm:px-4">
                <LocationCell location={row.locations[0]} />
                {row.locations.length > 1 && (
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                      <span className="group-open:hidden">+{row.locations.length - 1} more</span>
                      <span className="hidden group-open:inline">Fewer</span>
                    </summary>
                    <ul className="mt-1 space-y-0.5">
                      {row.locations.slice(1).map((location) => (
                        <li key={location}>
                          <LocationCell location={location} />
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </td>
              <td className="hidden px-3 py-2 text-right align-top tabular-nums text-zinc-600 sm:table-cell sm:px-4 dark:text-zinc-400">
                {formatQuantity(row.min, row.max) || '—'}
              </td>
              <td className="py-2 pr-3 pl-1 text-right align-top font-medium tabular-nums text-zinc-900 sm:px-4 dark:text-white">
                {row.drop_likelihood}%{/* On phones Qty and Sample are hidden, so the sample rides under the rate. */}
                <span className="block text-xs font-normal text-zinc-600 sm:hidden dark:text-zinc-400">
                  {formatCompactNumber(row.catches)} catches
                </span>
              </td>
              <td className="hidden px-3 py-2 text-right align-top tabular-nums text-zinc-600 sm:table-cell sm:px-4 dark:text-zinc-400">
                {formatNumber(row.catches)} catches
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Everything an item page knows about where it comes from and where it goes.
 *
 * All of it is baked in at build time (see scripts/update-data.js), so it
 * server-renders — the only thing still fetched from the client is the live
 * Markethunt price, inside ConvertibleContents.
 */
export function ItemData({
  itemId,
  obtainHint,
  contents,
  drops,
  foundIn,
  mapRelations,
  itemSlugs,
}: {
  itemId: number;
  obtainHint?: string;
  contents: ConvertibleRow[];
  drops: ItemDropper[];
  foundIn: FoundInConvertible[];
  mapRelations: MapRelation[];
  /** Slugs for the ids named in `mapRelations`. */
  itemSlugs: Record<number, string>;
}) {
  return (
    <div className="mt-10 space-y-10">
      {(obtainHint || drops.length > 0 || foundIn.length > 0) && (
        <section>
          <SectionHeading>How to get it</SectionHeading>

          {obtainHint && (
            <p className="mt-3 rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-4 py-3 text-sm font-medium text-amber-950 dark:bg-amber-950/40 dark:ring-amber-900 dark:text-amber-100">
              {obtainHint}
            </p>
          )}

          {drops.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Hunting drops</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                From <SourceLink source="mhct" />.
              </p>
              <div className="mt-4">
                <DropsTable rows={drops.slice(0, DROPS_PREVIEW)} />
              </div>
              {drops.length > DROPS_PREVIEW && (
                <details className="group mt-2">
                  <summary className="inline-flex min-h-9 cursor-pointer items-center rounded-md px-1 text-sm font-medium text-pink-700 hover:text-pink-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300 dark:hover:text-pink-200">
                    <span className="group-open:hidden">Show all {formatNumber(drops.length)}</span>
                    <span className="hidden group-open:inline">Show fewer</span>
                  </summary>
                  <div className="mt-2">
                    <DropsTable rows={drops.slice(DROPS_PREVIEW)} />
                  </div>
                </details>
              )}
            </div>
          )}
          {foundIn.length > 0 && (
            <div className={drops.length > 0 ? 'mt-8' : 'mt-5'}>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Found inside{' '}
                <span className="font-normal text-zinc-600 dark:text-zinc-400">({formatNumber(foundIn.length)})</span>
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {foundIn.slice(0, FOUND_IN_PREVIEW).map((source) => (
                  <li key={source.id ?? source.name}>
                    <SourceChip source={source} />
                  </li>
                ))}
              </ul>
              {foundIn.length > FOUND_IN_PREVIEW && (
                <details className="group mt-2">
                  <summary className="inline-flex min-h-9 cursor-pointer items-center rounded-md px-1 text-sm font-medium text-pink-700 hover:text-pink-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300 dark:hover:text-pink-200">
                    <span className="group-open:hidden">Show all {formatNumber(foundIn.length)}</span>
                    <span className="hidden group-open:inline">Show fewer</span>
                  </summary>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {foundIn.slice(FOUND_IN_PREVIEW).map((source) => (
                      <li key={source.id ?? source.name}>
                        <SourceChip source={source} />
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </section>
      )}

      {contents.length > 0 && <ConvertibleContents itemId={itemId} rows={contents} />}

      {mapRelations.length > 0 && <MapRelations itemId={itemId} relations={mapRelations} itemSlugs={itemSlugs} />}
    </div>
  );
}

/**
 * Ties a scroll case to the maps it opens into and the chests those maps award.
 * Renders from whichever side the user arrived on.
 */
function MapRelations({
  itemId,
  relations,
  itemSlugs,
}: {
  itemId: number;
  relations: MapRelation[];
  itemSlugs: Record<number, string>;
}) {
  const isScrollCase = relations[0].scrollCase.id === itemId;

  return (
    <section>
      <SectionHeading>{isScrollCase ? 'Maps it opens' : 'Which map awards it'}</SectionHeading>
      <div className="mt-4 space-y-3">
        {relations.map((relation) => (
          <div
            key={`${relation.map.mhctId}-${relation.scrollCase.id}`}
            className="rounded-2xl shadow-xs ring-1 ring-zinc-200 bg-white p-4 dark:ring-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold tracking-tight text-zinc-900 dark:text-white">{relation.map.name}</span>
              {!isScrollCase && (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  from{' '}
                  <ItemChipLink id={relation.scrollCase.id} name={relation.scrollCase.name} itemSlugs={itemSlugs} />
                </span>
              )}
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {relation.chests.map((chest) => (
                <li key={chest.id}>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full ring-1 px-3 py-1.5 text-sm shadow-xs transition ${
                      chest.id === itemId
                        ? 'bg-pink-50 text-pink-800 ring-pink-300 dark:bg-pink-950 dark:text-pink-200 dark:ring-pink-800'
                        : 'bg-white text-zinc-700 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800'
                    }`}
                  >
                    <ItemChipLink id={chest.id} name={chest.name} itemSlugs={itemSlugs} plain={chest.id === itemId} />
                    {chest.rare && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Rare
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** A map-relation item reference — a link, unless it's the page we're already on. */
function ItemChipLink({
  id,
  name,
  itemSlugs,
  plain,
}: {
  id: number;
  name: string;
  itemSlugs: Record<number, string>;
  plain?: boolean;
}) {
  const slug = itemSlugs[id];
  if (plain || !slug) return <>{name}</>;
  return (
    <Link href={`/items/${slug}`} className="transition hover:text-pink-700 dark:hover:text-pink-300">
      {name}
    </Link>
  );
}

/** A chest or other openable this item comes out of, as a pill with its picture. */
function SourceChip({ source }: { source: { name: string; slug?: string } }) {
  const classes =
    'inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800';
  return source.slug ? (
    <Link
      href={`/items/${source.slug}`}
      prefetch={false}
      className={`${classes} text-zinc-700 transition hover:text-pink-700 hover:ring-pink-300 dark:text-zinc-300 dark:hover:text-pink-300 dark:hover:ring-pink-800`}
    >
      <GameImage src={itemImageUrl(source.slug)} className="size-5 shrink-0 rounded" />
      {source.name}
    </Link>
  ) : (
    <span className={`${classes} text-zinc-600 dark:text-zinc-400`}>{source.name}</span>
  );
}
