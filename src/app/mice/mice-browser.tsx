'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Link } from 'next-view-transitions';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

import { POWER_TYPES, POWER_TYPE_CHIP, powerTypeLabel } from '@/lib/power-types';

export interface SlimMouse {
  id: number;
  name: string;
  slug: string;
  group: string;
  groupSlug?: string;
  subgroup?: string;
  power?: string[];
}

export interface SlimGroup {
  slug: string;
  name: string;
  count: number;
  description?: string;
}

export function MiceBrowser({ mice, groups }: { mice: SlimMouse[]; groups: SlimGroup[] }) {
  const [query, setQuery] = useState('');
  const [activePower, setActivePower] = useState<string | null>(null);
  const [adoptedUrl, setAdoptedUrl] = useState(false);

  // Adopt any ?weakto= / ?q= from the URL on first render, so filtered views are linkable.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const weakTo = params.get('weakto');
    if (weakTo && (POWER_TYPES as readonly string[]).includes(weakTo)) setActivePower(weakTo);
    const q = params.get('q');
    if (q) setQuery(q);
    setAdoptedUrl(true);
  }, []);

  // Reflect the active filters back into the URL so the view stays shareable.
  useEffect(() => {
    if (!adoptedUrl) return;
    const params = new URLSearchParams(window.location.search);
    if (activePower) params.set('weakto', activePower);
    else params.delete('weakto');
    if (query.trim()) params.set('q', query.trim());
    else params.delete('q');
    const search = params.toString();
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  }, [adoptedUrl, activePower, query]);

  const filtering = query.trim().length > 0 || activePower !== null;

  const results = useMemo(() => {
    if (!filtering) return [];
    const q = query.trim().toLowerCase();
    return mice
      .filter((mouse) => {
        if (activePower && !(mouse.power ?? []).includes(activePower)) return false;
        if (q && !mouse.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [mice, query, activePower, filtering]);

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search mice by name…"
          aria-label="Search mice by name"
          className="w-full border-0 bg-transparent py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
        />
        {filtering && (
          <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
            {results.length}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Weak to
        </span>
        {POWER_TYPES.map((type) => {
          const active = activePower === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActivePower((current) => (current === type ? null : type))}
              className={`rounded-md px-2 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                POWER_TYPE_CHIP[type]
              } ${active ? 'ring-2 ring-emerald-500' : ''} ${activePower && !active ? 'opacity-50' : ''}`}
            >
              {powerTypeLabel(type)}
            </button>
          );
        })}
      </div>

      {filtering ? (
        results.length === 0 ? (
          <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">No mice match your filters.</p>
        ) : (
          <ul className="mt-8 flex flex-wrap gap-2">
            {results.slice(0, 400).map((mouse) => (
              <li key={mouse.id}>
                <Link
                  href={`/mice/${mouse.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.mouse.rip/images/mice/thumbnail/${mouse.slug}.png`}
                    alt=""
                    loading="lazy"
                    className="size-6 shrink-0 rounded"
                  />
                  {mouse.name}
                </Link>
              </li>
            ))}
            {results.length > 400 && (
              <li className="w-full pt-2 text-sm text-zinc-400 dark:text-zinc-500">
                Showing the first 400 of {results.length} — keep typing to narrow it down.
              </li>
            )}
          </ul>
        )
      ) : (
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            Browse by group
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.slug}
                href={`/groups/${group.slug}`}
                className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md motion-reduce:transform-none dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">
                    {group.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                    {group.count}
                  </span>
                </div>
                {group.description && (
                  <span className="mt-1 line-clamp-2 text-sm text-pretty text-zinc-500 dark:text-zinc-400">
                    {group.description}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
