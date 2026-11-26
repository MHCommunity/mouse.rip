'use client';

import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { GameImage } from '@/components/game-image';
import { Input } from '@/components/input';
import { Link } from '@/components/link';
import { mouseImageUrl } from '@/lib/image-urls';
import { rankMice, type RankBy, type RankedMouse } from '@/lib/rankings';
import { formatNumber } from '@/utils';

export type { RankedMouse } from '@/lib/rankings';

const COLUMNS: { key: RankBy; label: string }[] = [
  { key: 'points', label: 'Points' },
  { key: 'gold', label: 'Gold' },
  { key: 'wisdom', label: 'Wisdom' },
];

/** Rows rendered at a time. All 1,300 at once is a heavy page on a phone, and slow to re-sort. */
const PAGE_SIZE = 100;

const selectClasses =
  'rounded-lg border border-zinc-950/10 bg-white px-3 py-1.5 text-sm/6 text-zinc-950 shadow-sm hover:border-zinc-950/20 focus:border-pink-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/20';

function isRankBy(value: string | null): value is RankBy {
  return value === 'points' || value === 'gold' || value === 'wisdom';
}

export function RankingsTableFromUrl({ mice }: { mice: RankedMouse[] }) {
  const params = useSearchParams();
  const by = params.get('by');
  return (
    <RankingsTable
      mice={mice}
      initialBy={isRankBy(by) ? by : 'points'}
      initialGroup={params.get('group') ?? ''}
      focus={params.get('mouse')}
      syncUrl
    />
  );
}

export function RankingsTable({
  mice,
  initialBy,
  initialGroup,
  focus,
  syncUrl,
}: {
  mice: RankedMouse[];
  initialBy: RankBy;
  initialGroup: string;
  /** The mouse a mouse page linked here for, to highlight and scroll to. */
  focus?: string | null;
  /** Off for the prerendered fallback, which mustn't rewrite a link it couldn't read. */
  syncUrl: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [by, setBy] = useState<RankBy>(initialBy);
  const [group, setGroup] = useState(initialGroup);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const moreRef = useRef<HTMLButtonElement>(null);

  const groups = useMemo(() => [...new Set(mice.map((mouse) => mouse.group))].sort(), [mice]);

  // Ranks are over every mouse, so filtering by group keeps each mouse's overall rank.
  const ranked = useMemo(() => rankMice(mice, by), [mice, by]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ranked.filter(
      ({ mouse }) => (!group || mouse.group === group) && (!needle || mouse.name.toLowerCase().includes(needle)),
    );
  }, [ranked, group, query]);

  // Render far enough down to reach the mouse a mouse page linked here for, with some rows below it to centre it.
  const focusIndex = focus ? rows.findIndex(({ mouse }) => mouse.slug === focus) : -1;
  const shown = rows.slice(0, Math.max(limit, focusIndex + 1 + PAGE_SIZE / 4));
  const remaining = rows.length - shown.length;

  // Load the next page as the end of the list comes near. The observer is made again after each page, so a
  // tall screen that can still see the end keeps loading until it can't.
  useEffect(() => {
    const button = moreRef.current;
    if (!button || remaining === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setLimit(shown.length + PAGE_SIZE);
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(button);
    return () => observer.disconnect();
  }, [shown.length, remaining]);

  // A mouse page links here with ?mouse=. Highlight that row, and bring it into view once the order is
  // right and the router has finished its own scrolling for the navigation.
  const highlight = focus ?? null;
  useEffect(() => {
    if (!focus) return;
    // Instant: the row can be tens of thousands of pixels down, too far to animate.
    const scroll = () => document.getElementById(focus)?.scrollIntoView({ block: 'center', behavior: 'instant' });
    // Again a moment later, in case the router's scroll lands after the first.
    const timers = [setTimeout(scroll, 50), setTimeout(scroll, 400)];
    return () => timers.forEach(clearTimeout);
  }, [focus, by, group]);

  const update = (nextBy: RankBy, nextGroup: string) => {
    setBy(nextBy);
    setGroup(nextGroup);
    setLimit(PAGE_SIZE);
    if (!syncUrl) return;
    const params = new URLSearchParams(window.location.search);
    params.set('by', nextBy);
    if (nextGroup) params.set('group', nextGroup);
    else params.delete('group');
    router.replace(`${pathname}?${params.toString()}${window.location.hash}`, { scroll: false });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" role="group" aria-label="Rank by">
          {COLUMNS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={by === key}
              onClick={() => update(key, group)}
              className={clsx(
                'rounded-md px-3 py-1 text-sm font-medium transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500',
                by === key
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-56">
            <Input
              type="search"
              aria-label="Find a mouse"
              placeholder="Find a mouse"
              autoComplete="off"
              value={query}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setQuery(event.target.value);
                setLimit(PAGE_SIZE);
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            Group
            <select className={selectClasses} value={group} onChange={(event) => update(by, event.target.value)}>
              <option value="">All groups</option>
              {groups.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-zinc-600 dark:text-zinc-400">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="w-14 px-3 py-2 text-right font-medium">Rank</th>
              <th className="px-3 py-2 font-medium">Mouse</th>
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  aria-sort={by === key ? 'descending' : undefined}
                  className={clsx(
                    'px-3 py-2 text-right font-medium',
                    by === key ? 'text-zinc-950 dark:text-white' : 'hidden sm:table-cell',
                  )}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {shown.map(({ mouse, rank }) => (
              <tr
                key={mouse.slug}
                id={mouse.slug}
                className={clsx('scroll-mt-24', highlight === mouse.slug && 'bg-pink-50 dark:bg-pink-950/40')}
              >
                <td className="px-3 py-1.5 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                  {formatNumber(rank)}
                </td>
                <td className="px-3 py-1.5">
                  <Link
                    href={`/mice/${mouse.slug}`}
                    prefetch={false}
                    className="inline-flex items-center gap-2 font-medium text-zinc-900 hover:text-pink-700 dark:text-zinc-100 dark:hover:text-pink-300"
                  >
                    <GameImage src={mouseImageUrl(mouse.slug)} width={24} height={24} className="size-6 shrink-0" />
                    {mouse.name}
                  </Link>
                  <span className="block pl-8 text-xs text-zinc-600 dark:text-zinc-400">{mouse.group}</span>
                </td>
                {COLUMNS.map(({ key }) => (
                  <td
                    key={key}
                    className={clsx(
                      'px-3 py-1.5 text-right tabular-nums',
                      by === key
                        ? 'font-semibold text-zinc-950 dark:text-white'
                        : 'hidden text-zinc-600 sm:table-cell dark:text-zinc-400',
                    )}
                  >
                    {formatNumber(mouse[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            No mice match “{query.trim()}”{group ? ` in ${group}` : ''}.
          </p>
        )}
      </div>
      {remaining > 0 && (
        <button
          ref={moreRef}
          type="button"
          onClick={() => setLimit(shown.length + PAGE_SIZE)}
          className="mt-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:text-zinc-950 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
        >
          Show {formatNumber(Math.min(PAGE_SIZE, remaining))} more of {formatNumber(remaining)}
        </button>
      )}
    </div>
  );
}
