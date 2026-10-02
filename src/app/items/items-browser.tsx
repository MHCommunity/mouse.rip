'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Link } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import { loadItemIndex, type IndexedItem } from '@/lib/client-index';
import { CLASSIFICATION_DESCRIPTIONS } from '@/lib/item-classifications';
import { itemImageUrl } from '@/lib/image-urls';
import { formatNumber, titleCase } from '@/utils';

const pillBase =
  'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

function filtersFromUrl(params: URLSearchParams, classificationOrder: string[]) {
  const type = params.get('type');
  return {
    active: type && classificationOrder.includes(type) ? type : null,
    query: params.get('q') ?? '',
    tradableOnly: params.get('tradable') === '1',
    tag: params.get('tag') ?? null,
  };
}

export function ItemsBrowser({
  counts,
  classificationOrder,
}: {
  /** Per-type totals, so the default view renders without the item list. */
  counts: Record<string, number>;
  classificationOrder: string[];
}) {
  // The item list itself is code-split and only fetched once the visitor
  // actually filters — the landing view is just the type cards, and the chunk is
  // shared with search and /marketplace, so it's often already cached.
  const [items, setItems] = useState<IndexedItem[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // The URL is the source of truth for the view, so a filtered page is linkable.
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const initial = filtersFromUrl(searchParams, classificationOrder);

  const [query, setQuery] = useState(initial.query);
  const [active, setActive] = useState<string | null>(initial.active);
  const [tradableOnly, setTradableOnly] = useState(initial.tradableOnly);
  // Set only by following a tag link from an item page; cleared from here.
  const [tag, setTag] = useState<string | null>(initial.tag);

  // Reflect the active filters back into the URL so the view stays shareable.
  // replaceState feeds back into useSearchParams, so remember what we wrote to
  // tell our own edits apart from a real navigation.
  const written = useRef(search);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (active) params.set('type', active);
    else params.delete('type');
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    if (tradableOnly) params.set('tradable', '1');
    else params.delete('tradable');
    if (tag) params.set('tag', tag);
    else params.delete('tag');
    const next = params.toString();
    written.current = next;
    window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname);
  }, [active, query, tradableOnly, tag]);

  // A soft navigation (the sidebar's Items link, a /items?type= card) changes the
  // URL out from under us; adopt it so the browser doesn't stay stuck on the
  // filter the visitor navigated away from.
  useEffect(() => {
    if (search === written.current) return;
    const next = filtersFromUrl(new URLSearchParams(search), classificationOrder);
    setActive(next.active);
    setQuery(next.query);
    setTradableOnly(next.tradableOnly);
    setTag(next.tag);
  }, [search, classificationOrder]);

  // Like the mice page: the default view is a grid of type cards, and the full
  // item list (with icons) only renders once a filter is active.
  const filtering = Boolean(query.trim()) || active !== null || tradableOnly || tag !== null;

  // Nothing is filterable until the list arrives, so only pay for it when the
  // visitor filters. Kicking the load off on mount would defeat the point.
  useEffect(() => {
    if (!filtering || items || loadFailed) return;
    let alive = true;
    loadItemIndex()
      .then((loaded) => alive && setItems(loaded))
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, [filtering, items, loadFailed]);

  const grouped = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    const map = new Map<string, IndexedItem[]>();
    for (const item of items) {
      if (active && item.classification !== active) continue;
      if (tradableOnly && !item.tradable) continue;
      if (tag && !item.tags?.includes(tag)) continue;
      if (q && !item.name.toLowerCase().includes(q)) continue;
      const list = map.get(item.classification) ?? [];
      list.push(item);
      map.set(item.classification, list);
    }
    return classificationOrder
      .filter((key) => map.has(key))
      .map((key) => [key, map.get(key)!.sort((a, b) => a.name.localeCompare(b.name))] as const);
  }, [items, query, active, tradableOnly, tag, classificationOrder]);

  const total = grouped.reduce((sum, [, list]) => sum + list.length, 0);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items by name…"
          aria-label="Search items by name"
          className="w-full border-0 bg-transparent py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
        />
        {filtering && items && (
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
            {titleCase(key)}
            <span className="ml-1.5 text-xs tabular-nums opacity-60">{formatNumber(counts[key] ?? 0)}</span>
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

      {tag && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setTag(null)}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            Tagged &ldquo;{tag.replaceAll('_', ' ')}&rdquo;
            <span aria-hidden="true">×</span>
            <span className="sr-only">Clear tag filter</span>
          </button>
        </div>
      )}

      {!filtering ? (
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Browse by type
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classificationOrder.map((key) => (
              <Link
                key={key}
                href={`/items/type/${key}`}
                className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md motion-reduce:transform-none dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
              >
                <div className="flex w-full items-baseline justify-between gap-2">
                  <span className="font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
                    {titleCase(key)}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                    {formatNumber(counts[key] ?? 0)}
                  </span>
                </div>
                {CLASSIFICATION_DESCRIPTIONS[key] && (
                  <span className="mt-1 line-clamp-2 text-sm text-pretty text-zinc-500 dark:text-zinc-400">
                    {CLASSIFICATION_DESCRIPTIONS[key]}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ) : loadFailed ? (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
          Couldn&rsquo;t load the item list. Reload the page to try again.
        </p>
      ) : !items ? (
        <div className="mt-8 space-y-2">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      ) : total === 0 ? (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">No items match your filters.</p>
      ) : (
        <div className="mt-8 space-y-10">
          {grouped.map(([key, list]) => (
            <section key={key}>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                {titleCase(key)}
                <span className="ml-2 text-xs font-normal tabular-nums text-zinc-400 dark:text-zinc-500">
                  {formatNumber(list.length)}
                </span>
              </h2>
              <ul className="mt-3 columns-2 gap-x-6 sm:columns-3 lg:columns-4">
                {list.map((item) => {
                  const slug = item.type.replaceAll('_', '-');
                  return (
                    <li key={item.id} className="break-inside-avoid">
                      <Link
                        href={`/items/${slug}`}
                        className="flex items-center gap-2 py-1 text-sm text-zinc-600 transition hover:text-blue-700 dark:text-zinc-400 dark:hover:text-blue-300"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={itemImageUrl(slug)}
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
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
