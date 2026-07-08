'use client';

import React, { useEffect, useState } from 'react';

import { CheeseCell, LocationCell } from '@/components/mhct-cells';

interface DropRow {
  location: string;
  stage: string | null;
  cheese: string;
  drop_pct: string | number;
  total_hunts?: number;
  min_amt: number;
  max_amt: number;
}

interface ConvertibleRow {
  id: number | string;
  name: string;
  min: number;
  max: number;
  chance: string | number;
}

type Loadable<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'empty' }
  | { status: 'error' };

function useEndpoint<T>(url: string | null, isEmpty: (data: T) => boolean): Loadable<T> {
  const [state, setState] = useState<Loadable<T>>(url ? { status: 'loading' } : { status: 'empty' });

  useEffect(() => {
    if (!url) return;
    let active = true;
    fetch(url)
      .then((res) => res.json() as Promise<T>)
      .then((data) => {
        if (!active) return;
        setState(isEmpty(data) ? { status: 'empty' } : { status: 'ready', data });
      })
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return state;
}

const sectionTitle =
  'text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500';

function SkeletonRows() {
  return (
    <div className="mt-4 space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      ))}
    </div>
  );
}

function formatQuantity(min: number, max: number): string {
  if (!min && !max) return '';
  if (min === max) return `${min}`;
  return `${min}–${max}`;
}

function formatGold(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

interface MarkethuntListRow {
  item_info: { item_id: number };
  // null for items Markethunt tracks but has no market data for (~10% of rows).
  latest_market_data: { price: number } | null;
}

/** Current marketplace prices by item id, fetched once from Markethunt. */
function useMarketPrices(enabled: boolean): Map<number, number> | null {
  const [prices, setPrices] = useState<Map<number, number> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetch('https://api.markethunt.win/items')
      .then((res) => (res.ok ? (res.json() as Promise<MarkethuntListRow[]>) : Promise.reject()))
      .then((rows) => {
        if (!active || !Array.isArray(rows)) return;
        setPrices(
          new Map(
            rows.flatMap((row) =>
              row.latest_market_data
                ? [[row.item_info.item_id, row.latest_market_data.price] as [number, number]]
                : []
            )
          )
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [enabled]);

  return prices;
}

/** Expected gold from one row: drop chance × average quantity × current price. */
function rowValue(row: ConvertibleRow, prices: Map<number, number> | null): number | null {
  const price = prices?.get(Number(row.id));
  if (price == null) return null;
  const averageQuantity = ((row.min ?? row.max ?? 0) + (row.max ?? row.min ?? 0)) / 2;
  const chance = Number(row.chance) / 100;
  if (!averageQuantity || !chance) return null;
  return price * averageQuantity * chance;
}

export function ItemLiveData({
  itemId,
  isConvertible,
}: {
  itemId: number;
  isConvertible: boolean;
}) {
  const contents = useEndpoint<ConvertibleRow[]>(
    isConvertible ? `https://api.mouse.rip/convertible/${itemId}` : null,
    (data) => !Array.isArray(data) || data.length === 0
  );
  const drops = useEndpoint<DropRow[]>(
    `https://api.mouse.rip/mhct-item/${itemId}`,
    (data) => !Array.isArray(data) || data.length === 0
  );
  const prices = useMarketPrices(isConvertible && contents.status === 'ready');

  const contentsRows =
    contents.status === 'ready'
      ? contents.data.map((row) => ({ row, value: rowValue(row, prices) }))
      : [];
  const expectedValue = contentsRows.reduce((sum, { value }) => sum + (value ?? 0), 0);
  const pricedCount = contentsRows.filter(({ value }) => value != null).length;
  const showValues = prices !== null && pricedCount > 0;
  const ownPrice = prices?.get(itemId);

  return (
    <div className="mt-10 space-y-10">
      {isConvertible && (
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
          {contents.status === 'loading' && <SkeletonRows />}
          {(contents.status === 'error' || contents.status === 'empty') && (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              No contents data available right now.
            </p>
          )}
          {contents.status === 'ready' && (
            <>
              <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">Reward</th>
                      <th className="px-4 py-2 text-right font-medium">Quantity</th>
                      <th className="px-4 py-2 text-right font-medium">Chance</th>
                      {showValues && (
                        <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">
                          Avg. value
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {contentsRows.map(({ row, value }, index) => (
                      <tr key={`${row.name}-${index}`}>
                        <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">{row.name}</td>
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
                      — it currently sells for{' '}
                      <span className="tabular-nums">{formatGold(ownPrice)} gold</span> on the
                      marketplace
                    </>
                  )}
                  .{' '}
                  <span className="text-zinc-400 dark:text-zinc-500">
                    Based on current Markethunt prices for {pricedCount} of {contentsRows.length}{' '}
                    possible rewards; each reward&rsquo;s average value is its chance × quantity ×
                    price.
                  </span>
                </p>
              )}
            </>
          )}
        </section>
      )}

      <section>
        <h2 className={sectionTitle}>Where it drops</h2>
        {drops.status === 'loading' && <SkeletonRows />}
        {drops.status === 'error' && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Couldn&rsquo;t load drop data right now.
          </p>
        )}
        {drops.status === 'empty' && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            No drop data recorded for this item.
          </p>
        )}
        {drops.status === 'ready' && (
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Location</th>
                  <th className="px-4 py-2 font-medium">Cheese</th>
                  <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">Qty</th>
                  <th className="px-4 py-2 text-right font-medium">Drop rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {drops.data.slice(0, 50).map((row, index) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
