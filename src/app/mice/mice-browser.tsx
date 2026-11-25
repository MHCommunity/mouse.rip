'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Link } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import { loadMouseIndex, type IndexedMouse } from '@/lib/client-index';
import { POWER_TYPES, POWER_TYPE_CHIP, bestPowerTypes, powerTypeLabel } from '@/lib/power-types';
import { mouseGroupImageUrl, mouseImageUrl } from '@/lib/image-urls';
import { GameImage } from '@/components/game-image';
import { SectionHeading } from '@/components/section-heading';

export interface SlimGroup {
  slug: string;
  name: string;
  count: number;
  description?: string;
}

function filtersFromUrl(params: URLSearchParams) {
  const weakTo = params.get('weakto');
  return {
    power: weakTo && (POWER_TYPES as readonly string[]).includes(weakTo) ? weakTo : null,
    query: params.get('q') ?? '',
  };
}

export function MiceBrowser({ groups }: { groups: SlimGroup[] }) {
  // The mouse list is code-split and only fetched once the visitor filters — the
  // landing view is just the group cards. The chunk is shared with site search,
  // so whichever comes first pays for both.
  const [mice, setMice] = useState<IndexedMouse[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // The URL is the source of truth for the view, so a filtered page is linkable.
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const initial = filtersFromUrl(searchParams);

  const [query, setQuery] = useState(initial.query);
  const [activePower, setActivePower] = useState<string | null>(initial.power);

  // Reflect the active filters back into the URL so the view stays shareable.
  // replaceState feeds back into useSearchParams, so remember what we wrote to
  // tell our own edits apart from a real navigation.
  const written = useRef(search);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activePower) params.set('weakto', activePower);
    else params.delete('weakto');
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    const next = params.toString();
    written.current = next;
    window.history.replaceState(null, '', next ? `?${next}` : window.location.pathname);
  }, [activePower, query]);

  // A soft navigation (the sidebar's Mice link, a /mice?weakto= link) changes the
  // URL out from under us; adopt it so the browser doesn't stay stuck on the
  // filter the visitor navigated away from.
  useEffect(() => {
    if (search === written.current) return;
    const next = filtersFromUrl(new URLSearchParams(search));
    setActivePower(next.power);
    setQuery(next.query);
  }, [search]);

  const filtering = query.trim().length > 0 || activePower !== null;

  useEffect(() => {
    if (!filtering || mice || loadFailed) return;
    let alive = true;
    loadMouseIndex()
      .then((loaded) => alive && setMice(loaded))
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, [filtering, mice, loadFailed]);

  const results = useMemo(() => {
    if (!filtering || !mice) return [];
    const q = query.trim().toLowerCase();
    return mice
      .filter((mouse) => {
        if (activePower && !bestPowerTypes(mouse.eff).includes(activePower)) return false;
        if (q && !mouse.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [mice, query, activePower, filtering]);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-zinc-950/45 bg-white px-4 shadow-sm focus-within:border-pink-600 focus-within:ring-2 focus-within:ring-pink-500/30 dark:border-white/35 dark:bg-zinc-900 dark:focus-within:border-pink-400">
        <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search mice by name…"
          aria-label="Search mice by name"
          className="w-full border-0 bg-transparent py-3 text-base text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-white dark:placeholder:text-zinc-400"
        />
        {filtering && mice && (
          <span className="shrink-0 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">{results.length}</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-sm text-zinc-600 dark:text-zinc-400">Weak to</span>
        {POWER_TYPES.map((type) => {
          const active = activePower === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActivePower((current) => (current === type ? null : type))}
              className={`rounded-md px-2 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
                POWER_TYPE_CHIP[type]
              } ${active ? 'ring-2 ring-pink-500' : ''} ${activePower && !active ? 'opacity-50' : ''}`}
            >
              {powerTypeLabel(type)}
            </button>
          );
        })}
      </div>

      {filtering ? (
        loadFailed ? (
          <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
            Couldn&rsquo;t load the mouse list. Reload the page to try again.
          </p>
        ) : !mice ? (
          <div className="mt-8 space-y-2">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <p className="mt-10 text-sm text-zinc-600 dark:text-zinc-400">
            No mice match
            {query.trim() && <> &ldquo;{query.trim()}&rdquo;</>}
            {activePower && <> weak to {powerTypeLabel(activePower)}</>}.{' '}
            <button
              type="button"
              className="font-medium text-pink-700 underline underline-offset-2 hover:text-pink-900 dark:text-pink-300"
              onClick={() => {
                setQuery('');
                setActivePower(null);
              }}
            >
              Clear filters
            </button>
          </p>
        ) : (
          <ul className="mt-8 flex flex-wrap gap-2">
            {results.slice(0, 400).map((mouse) => {
              const slug = mouse.type.replaceAll('_', '-');
              return (
                <li key={mouse.id}>
                  <Link
                    href={`/mice/${slug}`}
                    prefetch={false}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-pink-300 hover:text-pink-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-pink-800 dark:hover:text-pink-300"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mouseImageUrl(slug)} alt="" loading="lazy" className="size-6 shrink-0" />
                    {mouse.name}
                  </Link>
                </li>
              );
            })}
            {results.length > 400 && (
              <li className="w-full pt-2 text-sm text-zinc-400 dark:text-zinc-500">
                Showing the first 400 of {results.length}. Keep typing to narrow it down.
              </li>
            )}
          </ul>
        )
      ) : (
        <div className="mt-8">
          <SectionHeading>Browse by group</SectionHeading>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.slug}
                href={`/groups/${group.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors hover:border-pink-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800"
              >
                {/* The game's banner for the group: its mice, painted together. */}
                <GameImage
                  src={mouseGroupImageUrl(group.slug)}
                  width={600}
                  height={124}
                  className="aspect-[600/124] w-full border-b border-zinc-200 object-cover dark:border-zinc-800"
                />
                <span className="flex flex-1 flex-col px-4 pt-3 pb-4">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-pink-700 dark:text-white dark:group-hover:text-pink-300">
                      {group.name}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                      {group.count} {group.count === 1 ? 'mouse' : 'mice'}
                    </span>
                  </span>
                  {group.description && (
                    <span className="mt-1 line-clamp-2 text-sm text-pretty text-zinc-600 dark:text-zinc-400">
                      {group.description}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
