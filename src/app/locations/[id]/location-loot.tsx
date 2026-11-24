import React from 'react';

import { Link } from 'next-view-transitions';

import { GameImage } from '@/components/game-image';
import { SectionHeading } from '@/components/section-heading';
import { SourceLink } from '@/components/source-link';
import { itemImageUrl } from '@/lib/image-urls';
import type { LocationLootRow } from '@/types';
import { formatNumber } from '@/utils';

// Shown before "Show all", so the table doesn't bury the sections below it.
const LOOT_PREVIEW = 10;

function quantity(row: LocationLootRow): string {
  if (!row.min && !row.max) return '';
  return row.min === row.max ? `×${row.min}` : `×${row.min}–${row.max}`;
}

function LootRow({ row }: { row: LocationLootRow }) {
  return (
    <tr>
      <td className="px-3 py-2 sm:px-4">
        <Link
          href={`/items/${row.slug}`}
          className="inline-flex items-center gap-2 font-medium text-zinc-900 hover:text-pink-700 dark:text-white dark:hover:text-pink-300"
        >
          <GameImage src={itemImageUrl(row.slug)} width={24} height={24} className="size-6 shrink-0 rounded" />
          {row.name}
        </Link>
        <span className="mt-0.5 block text-xs text-zinc-600 dark:text-zinc-400">
          from{' '}
          <Link
            href={`/mice/${row.mouse_slug}`}
            className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:decoration-zinc-600 dark:hover:text-zinc-200"
          >
            {row.mouse_name}
          </Link>
        </span>
      </td>
      <td className="px-3 py-2 text-right align-top tabular-nums sm:px-4">
        <span className="font-medium text-zinc-900 dark:text-white">{row.rate}%</span>
        {quantity(row) && <span className="ml-1 text-zinc-600 dark:text-zinc-400">{quantity(row)}</span>}
        <span className="block text-xs whitespace-nowrap text-zinc-600 dark:text-zinc-400">
          {formatNumber(row.catches)} {row.catches === 1 ? 'catch' : 'catches'}
        </span>
      </td>
    </tr>
  );
}

function LootTable({ rows }: { rows: LocationLootRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <tr>
            <th className="px-3 py-2 font-medium sm:px-4">Item and best mouse</th>
            <th className="px-3 py-2 text-right font-medium sm:px-4">Drop rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((row) => (
            <LootRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * What the mice that live here drop. Each item shows the resident mouse most
 * likely to drop it; event and site-wide drops are filtered out when the data
 * is built (see scripts/update-data.js).
 */
export function LocationLoot({ rows }: { rows: LocationLootRow[] }) {
  if (rows.length === 0) return null;
  const preview = rows.slice(0, LOOT_PREVIEW);
  const rest = rows.slice(LOOT_PREVIEW);

  return (
    <section className="mt-10">
      <SectionHeading>Loot found here</SectionHeading>
      <p className="mt-1 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
        From <SourceLink source="mhct" />. Event and site-wide drops are left out.
      </p>
      <div className="mt-4">
        <LootTable rows={preview} />
      </div>
      {rest.length > 0 && (
        <details className="group mt-2">
          <summary className="inline-flex min-h-9 cursor-pointer items-center rounded-md px-1 text-sm font-medium text-pink-700 hover:text-pink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300 dark:hover:text-pink-200">
            <span className="group-open:hidden">Show all {rows.length}</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <div className="mt-2">
            <LootTable rows={rest} />
          </div>
        </details>
      )}
    </section>
  );
}
