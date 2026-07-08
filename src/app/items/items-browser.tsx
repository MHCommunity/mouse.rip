'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Link } from 'next-view-transitions';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export interface SlimItem {
  id: number;
  name: string;
  slug: string;
  classification: string;
  tradable?: boolean;
}

function classificationLabel(classification: string): string {
  return classification
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const pillBase =
  'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export function ItemsBrowser({
  items,
  classificationOrder,
}: {
  items: SlimItem[];
  classificationOrder: string[];
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [tradableOnly, setTradableOnly] = useState(false);
  const [adoptedUrl, setAdoptedUrl] = useState(false);

  // Adopt any ?type= / ?q= / ?tradable= from the URL on first render, so filtered
  // views are linkable.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type && classificationOrder.includes(type)) setActive(type);
    const q = params.get('q');
    if (q) setQuery(q);
    if (params.get('tradable') === '1') setTradableOnly(true);
    setAdoptedUrl(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect the active filters back into the URL so the view stays shareable.
  useEffect(() => {
    if (!adoptedUrl) return;
    const params = new URLSearchParams(window.location.search);
    if (active) params.set('type', active);
    else params.delete('type');
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    if (tradableOnly) params.set('tradable', '1');
    else params.delete('tradable');
    const search = params.toString();
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  }, [adoptedUrl, active, query, tradableOnly]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.classification, (map.get(item.classification) ?? 0) + 1);
    return map;
  }, [items]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, SlimItem[]>();
    for (const item of items) {
      if (active && item.classification !== active) continue;
      if (tradableOnly && !item.tradable) continue;
      if (q && !item.name.toLowerCase().includes(q)) continue;
      const list = map.get(item.classification) ?? [];
      list.push(item);
      map.set(item.classification, list);
    }
    return classificationOrder
      .filter((key) => map.has(key))
      .map((key) => [key, map.get(key)!.sort((a, b) => a.name.localeCompare(b.name))] as const);
  }, [items, query, active, tradableOnly, classificationOrder]);

  const total = grouped.reduce((sum, [, list]) => sum + list.length, 0);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter items by name…"
          aria-label="Filter items by name"
          className="w-full border-0 bg-transparent py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
        />
        {(query || active || tradableOnly) && (
          <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">{total}</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={`${pillBase} ${
            active === null
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {classificationOrder.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive((current) => (current === key ? null : key))}
            className={`${pillBase} ${
              active === key
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {classificationLabel(key)}
            <span className="ml-1.5 text-xs tabular-nums opacity-60">{counts.get(key) ?? 0}</span>
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={tradableOnly}
            onChange={(event) => setTradableOnly(event.target.checked)}
            className="size-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
          />
          Tradable only
        </label>
      </div>

      {total === 0 ? (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">No items match your filters.</p>
      ) : (
        <div className="mt-8 space-y-10">
          {grouped.map(([key, list]) => (
            <section key={key}>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                {classificationLabel(key)}
                <span className="ml-2 text-xs font-normal tabular-nums text-zinc-400 dark:text-zinc-500">
                  {list.length}
                </span>
              </h2>
              <ul className="mt-3 columns-2 gap-x-6 sm:columns-3 lg:columns-4">
                {list.map((item) => (
                  <li key={item.id} className="break-inside-avoid">
                    <Link
                      href={`/items/${item.slug}`}
                      className="flex items-center gap-2 py-1 text-sm text-zinc-600 transition hover:text-blue-700 dark:text-zinc-400 dark:hover:text-blue-300"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://i.mouse.rip/images/items/thumbnail/${item.slug}.png`}
                        alt=""
                        loading="lazy"
                        className="size-5 shrink-0 rounded"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
