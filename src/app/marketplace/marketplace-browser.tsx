'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Link } from 'next-view-transitions';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import { itemSlugsById, loadItemIndex } from '@/lib/client-index';
import hiddenItemIds from '@/data/generated/marketplace-hidden-items.json';
import { formatGold, formatSb } from '@/utils';
import { PriceChart, type PricePoint } from '@/app/items/[slug]/market-price';

interface MarketItem {
  item_info: { item_id: number; name: string; currently_tradeable: boolean };
  // null for items Markethunt tracks but has no market data for (~10% of rows).
  latest_market_data: { date: string; price: number; sb_price: number; volume: number | null } | null;
}

type PricedItem = MarketItem & { latest_market_data: NonNullable<MarketItem['latest_market_data']> };

const hiddenItems = new Set<number>(hiddenItemIds);

export function isVisibleMarketItem(item: MarketItem): item is PricedItem {
  return (
    item.latest_market_data !== null && item.item_info.currently_tradeable && !hiddenItems.has(item.item_info.item_id)
  );
}

type SortKey = 'volume' | 'price' | 'sb' | 'name';

type State = { status: 'loading' } | { status: 'ready'; items: PricedItem[] } | { status: 'error' };

interface MarketHistoryResponse {
  market_data?: PricePoint[];
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'volume', label: 'Volume' },
  { key: 'price', label: 'Price' },
  { key: 'sb', label: 'SB price' },
  { key: 'name', label: 'Name' },
];

function SuperBrieChart({ points }: { points: PricePoint[] }) {
  const latest = points[points.length - 1];
  const latestTime = new Date(latest.date).getTime();
  const window = points.filter((point) => new Date(point.date).getTime() >= latestTime - 90 * 86400000);
  const series = window.length > 1 ? window : points.slice(-2);
  const monthAgo = points.find((point) => new Date(point.date).getTime() >= latestTime - 30 * 86400000) ?? points[0];
  const change = monthAgo.price ? ((latest.price - monthAgo.price) / monthAgo.price) * 100 : 0;

  return (
    <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">SUPER|brie+ market rate</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            The marketplace&rsquo;s benchmark item over the last 90 days.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">
            {formatGold(latest.price)}
            <span className="ml-1 text-sm font-normal text-zinc-400">gold</span>
          </div>
          <div
            className={`mt-0.5 text-xs font-medium tabular-nums ${
              change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% in 30 days
          </div>
        </div>
      </div>
      <div className="mt-4">
        <PriceChart points={series} />
      </div>
    </section>
  );
}

export function MarketplaceBrowser() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [superBrieHistory, setSuperBrieHistory] = useState<PricePoint[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('volume');

  // id → item-page slug, so price rows can deep-link. Loaded from the shared
  // item chunk in parallel with the price fetch we're already waiting on, rather
  // than inlined into this page's HTML. Rows we can't resolve stay plain text.
  const [slugById, setSlugById] = useState<Record<number, string>>({});
  useEffect(() => {
    let alive = true;
    loadItemIndex()
      .then((items) => alive && setSlugById(itemSlugsById(items)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch('https://api.markethunt.win/items/114')
      .then((res) => (res.ok ? (res.json() as Promise<MarketHistoryResponse>) : Promise.reject()))
      .then((data) => {
        if (active && data.market_data && data.market_data.length > 1) {
          setSuperBrieHistory(data.market_data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch('https://api.markethunt.win/items')
      .then((res) => (res.ok ? (res.json() as Promise<MarketItem[]>) : Promise.reject()))
      .then((items) => {
        if (!Array.isArray(items)) throw new TypeError('Markethunt returned invalid item data');
        if (active) setState({ status: 'ready', items: items.filter(isVisibleMarketItem) });
      })
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (state.status !== 'ready') return [];
    const q = query.trim().toLowerCase();
    const filtered = q ? state.items.filter((item) => item.item_info.name.toLowerCase().includes(q)) : state.items;
    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'name') return a.item_info.name.localeCompare(b.item_info.name);
      if (sort === 'price') return b.latest_market_data.price - a.latest_market_data.price;
      if (sort === 'sb') return b.latest_market_data.sb_price - a.latest_market_data.sb_price;
      return (b.latest_market_data.volume ?? 0) - (a.latest_market_data.volume ?? 0);
    });
    return sorted;
  }, [state, query, sort]);

  const overview = useMemo(() => {
    if (state.status !== 'ready') return null;
    const sb = state.items.find((item) => item.item_info.item_id === 114);
    const mostTraded = state.items
      .filter((item) => item.item_info.item_id !== 114) // SB has its own tile
      .sort((a, b) => (b.latest_market_data.volume ?? 0) - (a.latest_market_data.volume ?? 0))[0];
    return { sb, tradeableCount: state.items.length, mostTraded };
  }, [state]);

  if (state.status === 'error') {
    return (
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        Couldn&rsquo;t reach Markethunt right now. Try again in a moment.
      </p>
    );
  }

  return (
    <div>
      {superBrieHistory.length > 1 && <SuperBrieChart points={superBrieHistory} />}

      {overview && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {overview.sb && (
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                SUPER|brie+ rate
              </div>
              <div className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
                {formatGold(overview.sb.latest_market_data.price)} gold
              </div>
              <div className="mt-0.5 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                {overview.sb.latest_market_data.volume != null
                  ? `${formatGold(overview.sb.latest_market_data.volume)} traded today`
                  : 'per SB'}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Items tracked
            </div>
            <div className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
              {state.status === 'ready' ? state.items.length.toLocaleString() : '—'}
            </div>
            <div className="mt-0.5 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
              {overview.tradeableCount.toLocaleString()} currently tradable
            </div>
          </div>
          {overview.mostTraded && (
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Most traded (after SB)
              </div>
              <div className="mt-0.5 truncate text-lg font-semibold text-zinc-900 dark:text-white">
                {slugById[overview.mostTraded.item_info.item_id] ? (
                  <Link
                    href={`/items/${slugById[overview.mostTraded.item_info.item_id]}`}
                    className="hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {overview.mostTraded.item_info.name}
                  </Link>
                ) : (
                  overview.mostTraded.item_info.name
                )}
              </div>
              <div className="mt-0.5 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                {overview.mostTraded.latest_market_data.volume != null
                  ? `${formatGold(overview.mostTraded.latest_market_data.volume)} traded today`
                  : ''}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search marketplace items by name…"
            aria-label="Search marketplace items by name"
            className="w-full border-0 bg-transparent py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {SORTS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                sort === option.key
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {state.status === 'loading' ? (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 font-medium">Item</th>
                <th className="px-4 py-2 text-right font-medium">Price</th>
                <th className="px-4 py-2 text-right font-medium">SB</th>
                <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.slice(0, query.trim() ? 100 : 50).map((item) => {
                const slug = slugById[item.item_info.item_id];
                const name = item.item_info.name;
                return (
                  <tr key={item.item_info.item_id}>
                    <td className="px-4 py-2 text-zinc-800 dark:text-zinc-200">
                      {slug ? (
                        <Link
                          href={`/items/${slug}`}
                          className="font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                        >
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-medium tabular-nums text-zinc-900 dark:text-white">
                      {formatGold(item.latest_market_data.price)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-zinc-500 dark:text-zinc-400">
                      {formatSb(item.latest_market_data.sb_price)}
                    </td>
                    <td className="hidden px-4 py-2 text-right tabular-nums text-zinc-400 sm:table-cell dark:text-zinc-500">
                      {item.latest_market_data.volume != null ? formatGold(item.latest_market_data.volume) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length > (query.trim() ? 100 : 50) && (
            <div className="border-t border-zinc-100 px-4 py-2 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
              Showing the first {query.trim() ? 100 : 50} of {rows.length.toLocaleString()} items
              {query.trim() ? ' — refine your search to see more.' : ' — search for a specific item to see it.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
