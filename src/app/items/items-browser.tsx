'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Link } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import { loadItemIndex, type IndexedItem } from '@/lib/client-index';
import {
  CLASSIFICATION_DESCRIPTIONS,
  SUBGROUPS,
  classificationLabel,
  classificationName,
  itemSubgroup,
  subgroupLabel,
  subgroupsPresent,
} from '@/lib/item-classifications';
import { itemImageUrl } from '@/lib/image-urls';
import { formatNumber } from '@/utils';
import { SectionHeading } from '@/components/section-heading';

/** The mice browser's cap too: past this, rows render on request. */
const ROW_LIMIT = 400;

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const emptyActionClasses =
  'rounded-full bg-white px-3 py-1 text-sm font-medium text-pink-700 ring-1 ring-zinc-200 hover:ring-pink-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:bg-zinc-900 dark:text-pink-300 dark:ring-zinc-700';

const pillBase =
  'shrink-0 rounded-full px-3 py-1 text-sm font-medium transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500';

function filtersFromUrl(params: URLSearchParams, classificationOrder: string[]) {
  const type = params.get('type');
  return {
    active: type && classificationOrder.includes(type) ? type : null,
    query: params.get('q') ?? '',
    tradableOnly: params.get('tradable') === '1',
    tag: params.get('tag') ?? null,
    sub: params.get('sub') ?? null,
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
  // shared with search, so it's often already cached.
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
  // A sub-group of the chosen type, for the types the game splits up.
  const [sub, setSub] = useState<string | null>(initial.sub);
  const subgroups = active ? SUBGROUPS[active] : undefined;
  const chooseType = (key: string | null) => {
    setActive(key);
    setSub(null);
  };

  // Reflect the active filters back into the URL so the view stays shareable.
  // replaceState feeds back into useSearchParams, so remember what we wrote to
  // tell our own edits apart from a real navigation.
  // Writes are deferred so typing doesn't call replaceState on every keystroke.
  const written = useRef(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (active) params.set('type', active);
      else params.delete('type');
      if (query.trim()) params.set('q', query.trim());
      else params.delete('q');
      if (tradableOnly) params.set('tradable', '1');
      else params.delete('tradable');
      if (tag) params.set('tag', tag);
      else params.delete('tag');
      if (sub) params.set('sub', sub);
      else params.delete('sub');
      const next = params.toString();
      written.current = next;
      window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname);
    }, 200);
    return () => clearTimeout(timer);
  }, [active, query, tradableOnly, tag, sub]);

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
    setSub(next.sub);
  }, [search, classificationOrder]);

  // Filtering 4,000+ items on every keystroke is wasted work; wait for a pause.
  const debouncedQuery = useDebouncedValue(query, 150);

  // Like the mice page: the default view is a grid of type cards, and the full
  // item list (with icons) only renders once a filter is active.
  const filtering = Boolean(debouncedQuery.trim()) || active !== null || tradableOnly || tag !== null;

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

  // Lowercase and sort once per load, not once per filter change.
  const sortedItems = useMemo(
    () =>
      items
        ?.map((item) => ({ item, lowerName: item.name.toLowerCase() }))
        .sort((a, b) => a.item.name.localeCompare(b.item.name)) ?? [],
    [items],
  );

  // Sections are types, or a split type's sub-groups once that type is chosen.
  const { grouped, subCounts } = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const map = new Map<string, IndexedItem[]>();
    const perSub: Record<string, number> = {};
    for (const { item, lowerName } of sortedItems) {
      if (active && item.classification !== active) continue;
      if (tradableOnly && !item.tradable) continue;
      if (tag && !item.tags?.includes(tag)) continue;
      if (q && !lowerName.includes(q)) continue;
      const group = subgroups ? (itemSubgroup(item) ?? '') : item.classification;
      if (subgroups) perSub[group] = (perSub[group] ?? 0) + 1;
      if (sub && group !== sub) continue;
      const list = map.get(group) ?? [];
      list.push(item);
      map.set(group, list);
    }
    const order = active && subgroups ? subgroupsPresent(active, map.keys()) : classificationOrder;
    return {
      grouped: order.filter((key) => map.has(key)).map((key) => [key, map.get(key)!] as const),
      subCounts: perSub,
    };
  }, [sortedItems, debouncedQuery, active, subgroups, sub, tradableOnly, tag, classificationOrder]);
  const sectionName = (key: string) => (active && subgroups ? subgroupLabel(active, key) : classificationName(key));

  const total = grouped.reduce((sum, [, list]) => sum + list.length, 0);

  // What each type chip would show if picked: every filter except the type itself.
  const chipCounts = useMemo(() => {
    if (!items) return counts;
    const q = debouncedQuery.trim().toLowerCase();
    const out: Record<string, number> = {};
    for (const { item, lowerName } of sortedItems) {
      if (tradableOnly && !item.tradable) continue;
      if (tag && !item.tags?.includes(tag)) continue;
      if (q && !lowerName.includes(q)) continue;
      out[item.classification] = (out[item.classification] ?? 0) + 1;
    }
    return out;
  }, [items, counts, sortedItems, debouncedQuery, tradableOnly, tag]);

  // Broad filters (a whole type, tradable only) can match thousands of items, so
  // render the first ROW_LIMIT until asked. Changing the filters re-caps it.
  const filterKey = [debouncedQuery.trim(), active, sub, tradableOnly, tag].join('|');
  const [expandedFor, setExpandedFor] = useState<string | null>(null);
  const showAll = expandedFor === filterKey;
  const visible = useMemo(() => {
    let budget = showAll ? Number.POSITIVE_INFINITY : ROW_LIMIT;
    const out = [];
    for (const [key, list] of grouped) {
      if (budget <= 0) break;
      const shown = list.slice(0, budget);
      budget -= shown.length;
      out.push([key, list, shown] as const);
    }
    return out;
  }, [grouped, showAll]);

  // Types with a description get a card; the rest are rare enough for a line of links.
  const mainTypes = classificationOrder.filter((key) => CLASSIFICATION_DESCRIPTIONS[key]);
  const otherTypes = classificationOrder.filter((key) => !CLASSIFICATION_DESCRIPTIONS[key]);

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
          className="w-full border-0 bg-transparent py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden dark:text-white"
        />
        {filtering && items && (
          <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{total}</span>
        )}
      </div>

      {/* Type chips narrow a search; with no filter on, the type cards below do that job instead.
          The toggle keeps its own column so the chips coming and going never move it. */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="order-last flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:order-first">
          {filtering && (
            <>
              <button
                type="button"
                onClick={() => chooseType(null)}
                className={`${pillBase} ${
                  active === null
                    ? 'bg-pink-600 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                All
              </button>
              {classificationOrder
                .filter((key) => active === key || (chipCounts[key] ?? 0) > 0)
                .map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => chooseType(active === key ? null : key)}
                    className={`${pillBase} ${
                      active === key
                        ? 'bg-pink-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {classificationName(key)}
                    <span className="ml-1.5 text-xs font-normal tabular-nums">
                      {formatNumber(chipCounts[key] ?? 0)}
                    </span>
                  </button>
                ))}
            </>
          )}
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 self-end py-1 text-sm text-zinc-600 sm:self-auto dark:text-zinc-300">
          <input
            type="checkbox"
            checked={tradableOnly}
            onChange={(event) => setTradableOnly(event.target.checked)}
            className="size-4 rounded border-zinc-300 text-pink-600 focus:ring-pink-500 dark:border-zinc-600"
          />
          Tradable only
        </label>
      </div>

      {filtering && active && subgroups && items && (
        <div
          className="mt-3 flex flex-wrap items-center gap-2 border-l-2 border-pink-200 pl-3 dark:border-pink-900"
          aria-label={`${classificationName(active)} groups`}
          role="group"
        >
          {[null, ...subgroupsPresent(active, Object.keys(subCounts))].map((key) => (
            <button
              key={key ?? 'all'}
              type="button"
              onClick={() => setSub(key)}
              aria-pressed={sub === key}
              className={`${pillBase} ${
                sub === key
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {key ? subgroupLabel(active, key) : `All ${classificationLabel(active).toLowerCase()}`}
              <span className="ml-1.5 text-xs font-normal tabular-nums">
                {formatNumber(key ? (subCounts[key] ?? 0) : Object.values(subCounts).reduce((a, b) => a + b, 0))}
              </span>
            </button>
          ))}
        </div>
      )}

      {tag && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setTag(null)}
            className="inline-flex items-center gap-1.5 rounded-md bg-pink-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-pink-700"
          >
            Tagged &ldquo;{tag.replaceAll('_', ' ')}&rdquo;
            <span aria-hidden="true">×</span>
            <span className="sr-only">Clear tag filter</span>
          </button>
        </div>
      )}

      {!filtering ? (
        <div className="mt-8">
          <SectionHeading>Browse by type</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mainTypes.map((key) => (
              <Link
                key={key}
                href={`/items/type/${key}`}
                className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md motion-reduce:transform-none dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800"
              >
                <div className="flex w-full items-baseline justify-between gap-2">
                  <span className="font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-pink-700 dark:text-white dark:group-hover:text-pink-300">
                    {classificationName(key)}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatNumber(counts[key] ?? 0)}
                  </span>
                </div>
                <span className="mt-1 line-clamp-2 text-sm text-pretty text-zinc-500 dark:text-zinc-400">
                  {CLASSIFICATION_DESCRIPTIONS[key]}
                </span>
              </Link>
            ))}
          </div>
          {otherTypes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Other types</h3>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                {otherTypes.map((key) => (
                  <li key={key}>
                    <Link
                      href={`/items/type/${key}`}
                      className="text-zinc-700 hover:text-pink-700 hover:underline dark:text-zinc-300 dark:hover:text-pink-300"
                    >
                      {classificationName(key)}
                    </Link>
                    <span className="ml-1.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {formatNumber(counts[key] ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
        <div className="mt-10 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            No items match
            {debouncedQuery.trim() ? ` “${debouncedQuery.trim()}”` : ' these filters'}
            {active ? ` among ${classificationLabel(active).toLowerCase()}` : ''}.
          </p>
          <p className="mt-3 flex flex-wrap gap-2">
            {/* The search may match items of another type; offer the way there first. */}
            {active && Object.entries(chipCounts).some(([key, count]) => key !== active && count > 0) && (
              <button type="button" onClick={() => chooseType(null)} className={emptyActionClasses}>
                Search every type
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                chooseType(null);
                setQuery('');
                setTradableOnly(false);
                setTag(null);
              }}
              className={emptyActionClasses}
            >
              Clear filters
            </button>
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {visible.map(([key, list, shown]) => (
            <section key={key}>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
                {sectionName(key)}
                <span className="ml-2 text-xs font-normal tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatNumber(list.length)}
                </span>
              </h2>
              <ul className="mt-3 columns-2 gap-x-6 sm:columns-3 lg:columns-4">
                {shown.map((item) => {
                  const slug = item.type.replaceAll('_', '-');
                  return (
                    <li key={item.id} className="break-inside-avoid">
                      <Link
                        href={`/items/${slug}`}
                        prefetch={false}
                        className="flex items-center gap-2 py-1 text-sm text-zinc-600 transition hover:text-pink-700 dark:text-zinc-400 dark:hover:text-pink-300"
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
          {total > ROW_LIMIT && !showAll && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Showing the first {formatNumber(ROW_LIMIT)} of {formatNumber(total)}.{' '}
              <button
                type="button"
                onClick={() => setExpandedFor(filterKey)}
                className="font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
              >
                Show all
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
