'use client';

import React, { useEffect, useState } from 'react';

import { Link } from 'next-view-transitions';

import { sectionTitle } from '@/components/live-data';
import type { ConvertibleRow } from '@/types';
import { formatGold } from '@/utils';
import { itemImageUrl } from '@/lib/image-urls';

interface MarkethuntListRow {
  item_info: { item_id: number };
  // null for items Markethunt tracks but has no market data for (~10% of rows).
  latest_market_data: { price: number } | null;
}

/**
 * Rewards that aren't tradable on Markethunt but still have a known gold value.
 * Gold (431) is worth exactly 1 gold a unit; Points (644) has no gold value, so
 * it stays unpriced rather than being counted as zero.
 */
const INTRINSIC_PRICES: Record<number, number> = { 431: 1 };

/**
 * Current marketplace prices by item id, fetched once from Markethunt. Stays
 * null unless the fetch actually succeeds: with no market data, the only rewards
 * we could price are the intrinsic ones, and totalling those alone would state a
 * confident "worth ~X gold" that is off by orders of magnitude.
 */
function useMarketPrices(): Map<number, number> | null {
  const [prices, setPrices] = useState<Map<number, number> | null>(null);

  useEffect(() => {
    let active = true;
    fetch('https://api.markethunt.win/items')
      .then((res) => (res.ok ? (res.json() as Promise<MarkethuntListRow[]>) : Promise.reject()))
      .then((rows) => {
        if (!active || !Array.isArray(rows)) return;
        setPrices(
          new Map(
            rows.flatMap((row) =>
              row.latest_market_data ? [[row.item_info.item_id, row.latest_market_data.price] as [number, number]] : [],
            ),
          ),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return prices;
}

/** Expected gold from one row: drop chance × average quantity × current price. */
function rowValue(row: ConvertibleRow, prices: Map<number, number> | null): number | null {
  const price = INTRINSIC_PRICES[row.id] ?? prices?.get(row.id);
  if (price == null) return null;
  const averageQuantity = ((row.min ?? row.max ?? 0) + (row.max ?? row.min ?? 0)) / 2;
  const chance = Number(row.chance) / 100;
  if (!averageQuantity || !chance) return null;
  return price * averageQuantity * chance;
}

function formatQuantity(min: number, max: number): string {
  if (!min && !max) return '';
  if (min === max) return `${min}`;
  return `${min}–${max}`;
}

/**
 * The reward table. Rows are baked in at build time, so they render on the
 * server and land in the HTML; only the gold values need Markethunt, and they
 * fill in after hydration.
 */
export function ConvertibleContents({ itemId, rows }: { itemId: number; rows: ConvertibleRow[] }) {
  const prices = useMarketPrices();

  const valued = rows.map((row) => ({ row, value: rowValue(row, prices) }));
  const expectedValue = valued.reduce((sum, { value }) => sum + (value ?? 0), 0);
  const pricedCount = valued.filter(({ value }) => value != null).length;
  const showValues = prices !== null && pricedCount > 0;
  const ownPrice = prices?.get(itemId);

  return (
    <section>
      <h2 className={sectionTitle}>What&rsquo;s inside</h2>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Possible rewards from opening this, with observed chances from{' '}
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

      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2 font-medium">Reward</th>
              <th className="px-4 py-2 text-right font-medium">Quantity</th>
              <th className="px-4 py-2 text-right font-medium">Chance</th>
              {showValues && <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">Avg. value</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {valued.map(({ row, value }, index) => (
              <tr key={`${row.name}-${index}`}>
                <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                  {row.slug ? (
                    <Link
                      href={`/items/${row.slug}`}
                      className="inline-flex items-center gap-2 transition hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={itemImageUrl(row.slug)}
                        alt=""
                        loading="lazy"
                        className="size-6 shrink-0 rounded"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                      {row.name}
                    </Link>
                  ) : (
                    row.name
                  )}
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                  {formatQuantity(row.min, row.max)}
                </td>
                <td className="px-4 py-2 text-right font-medium tabular-nums text-zinc-900 dark:text-white">
                  {Number(row.chance) > 0 ? `${row.chance}%` : '—'}
                </td>
                {showValues && (
                  <td className="hidden px-4 py-2 text-right tabular-nums text-zinc-500 sm:table-cell dark:text-zinc-400">
                    {value != null ? `${formatGold(value)} gold` : '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showValues && expectedValue > 0 && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          Opening one is worth{' '}
          <strong className="font-semibold tabular-nums text-zinc-900 dark:text-white">
            ~{formatGold(expectedValue)} gold
          </strong>{' '}
          on average
          {ownPrice != null && (
            <>
              {' '}
              — it currently sells for <span className="tabular-nums">{formatGold(ownPrice)} gold</span> on the
              marketplace
            </>
          )}
          .{' '}
          <span className="text-zinc-400 dark:text-zinc-500">
            Covers {pricedCount} of {valued.length} possible rewards, at current Markethunt prices; each reward&rsquo;s
            average value is its chance × quantity × price.
          </span>
        </p>
      )}
    </section>
  );
}
