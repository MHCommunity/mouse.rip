import React from 'react';

import { Link } from 'next-view-transitions';

import { CheeseCell, LocationCell } from '@/components/mhct-cells';
import { sectionTitle } from '@/components/live-data';
import type { ConvertibleRow, FoundInConvertible, ItemDrops, MapRelation } from '@/types';
import { formatNumber } from '@/utils';
import { itemImageUrl } from '@/lib/image-urls';
import { ConvertibleContents } from './convertible-contents';

function formatQuantity(min: number, max: number): string {
  if (!min && !max) return '';
  if (min === max) return `${min}`;
  return `${min}–${max}`;
}

/**
 * Everything an item page knows about where it comes from and where it goes.
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
  drops: ItemDrops;
  foundIn: FoundInConvertible[];
  mapRelations: MapRelation[];
  /** Slugs for the ids named in `mapRelations`. */
  itemSlugs: Record<number, string>;
}) {
  return (
    <div className="mt-10 space-y-10">
      {(obtainHint || drops.rows.length > 0 || foundIn.length > 0) && (
        <section>
          <h2 className={sectionTitle}>How to get it</h2>

          {obtainHint && (
            <p className="mt-3 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900 dark:bg-blue-950/50 dark:text-blue-200">
              {obtainHint}
            </p>
          )}

          {foundIn.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">From openables</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Chests, baskets, and other items that can contain this.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {foundIn.map((source) => (
                  <li key={source.id ?? source.name}>
                    {source.slug ? (
                      <Link
                        href={`/items/${source.slug}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:text-blue-300"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={itemImageUrl(source.slug)}
                          alt=""
                          loading="lazy"
                          className="size-5 shrink-0 rounded"
                        />
                        {source.name}
                      </Link>
                    ) : (
                      <span className="inline-flex rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                        {source.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {drops.rows.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Hunting drops</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Observed drop rates by location and cheese, from{' '}
                <a
                  href="https://mhct.win"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  MHCT
                </a>
                . Rates are crowdsourced — check the sample size before trusting one.
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">Location</th>
                      <th className="px-4 py-2 font-medium">Cheese</th>
                      <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">Qty</th>
                      <th className="px-4 py-2 text-right font-medium">Drop rate</th>
                      <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">Sample</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {drops.rows.map((row, index) => (
                      <tr key={`${row.location}-${row.stage}-${row.cheese}-${index}`}>
                        <td className="px-4 py-2">
                          <LocationCell location={row.location} stage={row.stage} />
                        </td>
                        <td className="px-4 py-2">
                          <CheeseCell cheese={row.cheese} />
                        </td>
                        <td className="hidden px-4 py-2 text-right tabular-nums text-zinc-400 sm:table-cell dark:text-zinc-500">
                          {formatQuantity(row.min_amt, row.max_amt) || '—'}
                        </td>
                        <td className="px-4 py-2 text-right font-medium tabular-nums text-zinc-900 dark:text-white">
                          {row.drop_pct}%
                        </td>
                        <td className="hidden px-4 py-2 text-right tabular-nums text-zinc-400 sm:table-cell dark:text-zinc-500">
                          {row.total_hunts ? `${formatNumber(row.total_hunts)} hunts` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {drops.total > drops.rows.length && (
                <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">
                  Showing the {drops.rows.length} best of {formatNumber(drops.total)} recorded location/cheese
                  combinations.
                </p>
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
      <h2 className={sectionTitle}>{isScrollCase ? 'Maps it opens' : 'Which map awards it'}</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {isScrollCase
          ? 'Opening this scroll case starts one of these maps. Completing a map awards its treasure chest.'
          : 'This chest is awarded for completing the map below, which starts from its scroll case.'}
      </p>
      <div className="mt-4 space-y-3">
        {relations.map((relation) => (
          <div
            key={`${relation.map.mhctId}-${relation.scrollCase.id}`}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold tracking-tight text-zinc-900 dark:text-white">{relation.map.name}</span>
              {!isScrollCase && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  from{' '}
                  <ItemChipLink id={relation.scrollCase.id} name={relation.scrollCase.name} itemSlugs={itemSlugs} />
                </span>
              )}
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {relation.chests.map((chest) => (
                <li key={chest.id}>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm shadow-sm transition ${
                      chest.id === itemId
                        ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'
                        : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                    }`}
                  >
                    <ItemChipLink id={chest.id} name={chest.name} itemSlugs={itemSlugs} plain={chest.id === itemId} />
                    {chest.rare && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:bg-amber-950 dark:text-amber-300">
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
    <Link href={`/items/${slug}`} className="transition hover:text-blue-700 dark:hover:text-blue-300">
      {name}
    </Link>
  );
}
