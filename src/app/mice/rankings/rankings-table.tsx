'use client';

import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { GameImage } from '@/components/game-image';
import { Link } from '@/components/link';
import { mouseImageUrl } from '@/lib/image-urls';
import { formatNumber } from '@/utils';

export interface RankedMouse {
  slug: string;
  name: string;
  group: string;
  points: number;
  gold: number;
  wisdom: number;
}

type RankBy = 'points' | 'gold' | 'wisdom';

const COLUMNS: { key: RankBy; label: string }[] = [
  { key: 'points', label: 'Points' },
  { key: 'gold', label: 'Gold' },
  { key: 'wisdom', label: 'Wisdom' },
];

const selectClasses =
  'rounded-lg border border-zinc-950/10 bg-white px-3 py-1.5 text-sm/6 text-zinc-950 shadow-sm hover:border-zinc-950/20 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/20';

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

  const groups = useMemo(() => [...new Set(mice.map((mouse) => mouse.group))].sort(), [mice]);

  // Ranks are over every mouse, so filtering by group keeps each mouse's overall rank.
  const rows = useMemo(() => {
    const sorted = [...mice].sort((a, b) => b[by] - a[by] || a.name.localeCompare(b.name));
    let rank = 0;
    let previous: number | null = null;
    const ranked = sorted.map((mouse, index) => {
      if (mouse[by] !== previous) {
        rank = index + 1;
        previous = mouse[by];
      }
      return { mouse, rank };
    });
    return group ? ranked.filter(({ mouse }) => mouse.group === group) : ranked;
  }, [mice, by, group]);

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
                'rounded-md px-3 py-1 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500',
                by === key
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white'
                  : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white',
              )}
            >
              {label}
            </button>
          ))}
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
            {rows.map(({ mouse, rank }) => (
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
      </div>
    </div>
  );
}
