'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'next-view-transitions';
import clsx from 'clsx';

import { ColorScaleBadge, MinluckLegend } from '@/components/color-scale-badge';
import { PageHeader } from '@/components/page-header';
import { GameImage } from '@/components/game-image';
import { Input, InputGroup } from '@/components/input';

import { SlimMouse } from '@/types';

import { loadMouseIndex } from '@/lib/client-index';
import { mouseImageUrl } from '@/lib/image-urls';
import { POWER_TYPES, POWER_TYPE_CHIP, powerTypeLabel, powerTypeSetLabel } from '@/lib/power-types';

type MinluckKey = keyof NonNullable<SlimMouse['minlucks']>;

function minluckFor(mouse: SlimMouse, type: string): number | null {
  const value = mouse.minlucks?.[type as MinluckKey];
  return typeof value === 'number' && value > 0 ? value : null;
}

/** Groups a mouse's minlucks by value, lowest first. */
function minlucksByValue(mouse: SlimMouse) {
  const byValue = new Map<number, string[]>();
  for (const type of POWER_TYPES) {
    const value = minluckFor(mouse, type);
    if (value === null) continue;
    byValue.set(value, [...(byValue.get(value) ?? []), type]);
  }
  return [...byValue.entries()].sort(([a], [b]) => a - b).map(([value, types]) => ({ value, types }));
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function MouseRow({ mouse, power }: { mouse: SlimMouse; power: string | null }) {
  const rows = power ? [{ value: minluckFor(mouse, power) ?? 0, types: [power] }] : minlucksByValue(mouse);

  return (
    <li className="flex items-center gap-3 border-b border-zinc-100 py-2.5 [contain-intrinsic-size:auto_72px] [content-visibility:auto] last:border-b-0 dark:border-zinc-800">
      <GameImage src={mouseImageUrl(mouse.type)} width={48} height={48} className="size-12 shrink-0" />
      <div className="min-w-0 flex-1">
        <Link
          href={`/mice/${mouse.type.replaceAll('_', '-')}`}
          prefetch={false}
          className="font-medium text-zinc-900 hover:text-pink-700 dark:text-zinc-100 dark:hover:text-pink-300"
        >
          {mouse.name}
        </Link>
        {(mouse.group || mouse.subgroup) && (
          <div className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">
            {mouse.group}
            {mouse.subgroup && ` (${mouse.subgroup})`}
          </div>
        )}
      </div>
      <dl className="flex max-w-[60%] min-w-0 flex-col items-end gap-1">
        {rows.length === 0 ? (
          <dd className="text-sm text-zinc-600 dark:text-zinc-400">No data</dd>
        ) : (
          rows.map((row) => (
            <div key={row.value} className="flex items-center gap-2">
              <dt className="text-right text-sm text-pretty text-zinc-700 dark:text-zinc-300">
                {powerTypeSetLabel(row.types)}
              </dt>
              <dd>
                <ColorScaleBadge value={row.value} />
              </dd>
            </div>
          ))
        )}
      </dl>
    </li>
  );
}

export default function MinLucksPage() {
  // MinLucks reads ?q= and ?power= with useSearchParams, which needs a Suspense
  // boundary so the header can still be prerendered.
  return (
    <div>
      <PageHeader
        title="Mouse Minlucks"
        description="The minimum luck that guarantees a catch with each power type. Search by mouse or group, or pick a power type to see only what it can catch."
      />
      {/* Until the link's filters are readable, show the page unfiltered rather than nothing. */}
      <Suspense fallback={<MinLucks initialQuery="" initialPower={null} syncUrl={false} />}>
        <MinLucksFromUrl />
      </Suspense>
    </div>
  );
}

function MinLucksFromUrl() {
  const searchParams = useSearchParams();
  const param = searchParams.get('power');
  return (
    <MinLucks
      initialQuery={searchParams.get('q') ?? ''}
      initialPower={param && (POWER_TYPES as readonly string[]).includes(param) ? param : null}
      syncUrl
    />
  );
}

function MinLucks({
  initialQuery,
  initialPower,
  syncUrl,
}: {
  initialQuery: string;
  initialPower: string | null;
  /** Off for the prerendered fallback, which mustn't rewrite a link it couldn't read. */
  syncUrl: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mice, setMice] = useState<SlimMouse[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [filter, setFilter] = useState(initialQuery);
  const [power, setPower] = useState<string | null>(initialPower);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the filter for keyboard users on desktop only: on a phone it would
  // open the keyboard over the results.
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let alive = true;
    loadMouseIndex()
      .then((loaded) => alive && setMice(loaded))
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const debouncedFilter = useDebouncedValue(filter, 200);

  // Keep the URL shareable without adding history entries per keystroke.
  useEffect(() => {
    if (!syncUrl) return;
    const params = new URLSearchParams();
    if (debouncedFilter.trim()) params.set('q', debouncedFilter.trim());
    if (power) params.set('power', power);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [debouncedFilter, power, pathname, router, syncUrl]);

  const filteredMice = useMemo(() => {
    if (!mice) return [];
    const f = debouncedFilter.trim().toLowerCase();
    let result = mice;
    if (f) {
      result = result.filter(
        (mouse) =>
          mouse.name.toLowerCase().includes(f) ||
          mouse.group?.toLowerCase().includes(f) ||
          mouse.subgroup?.toLowerCase().includes(f),
      );
    }
    if (power) {
      result = result
        .filter((mouse) => minluckFor(mouse, power) !== null)
        .sort((a, b) => (minluckFor(a, power) ?? 0) - (minluckFor(b, power) ?? 0));
    }
    return result;
  }, [mice, debouncedFilter, power]);

  return (
    <div>
      <div className="space-y-4">
        <InputGroup>
          <Input
            id="minluck-search"
            type="search"
            placeholder="Search mice or groups…"
            ref={inputRef}
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
            aria-label="Search mice or groups"
          />
        </InputGroup>

        <fieldset>
          <legend className="sr-only">Show minlucks for one power type</legend>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-pressed={power === null}
              onClick={() => setPower(null)}
              className={clsx(
                'min-h-9 rounded-md px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500',
                power === null
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
              )}
            >
              All types
            </button>
            {POWER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={power === type}
                onClick={() => setPower(power === type ? null : type)}
                className={clsx(
                  'min-h-9 rounded-md px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500',
                  POWER_TYPE_CHIP[type],
                  power === type ? 'ring-2 ring-zinc-900 dark:ring-white' : 'opacity-80 hover:opacity-100',
                )}
              >
                {powerTypeLabel(type)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <MinluckLegend />
          {mice && (
            <p className="text-sm text-zinc-600 tabular-nums dark:text-zinc-400" aria-live="polite">
              {filteredMice.length.toLocaleString()} {filteredMice.length === 1 ? 'mouse' : 'mice'}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        {loadFailed ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Couldn&rsquo;t load the mouse list. Reload the page to try again.
          </p>
        ) : !mice ? (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : filteredMice.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No mice match
            {debouncedFilter.trim() && <> &ldquo;{debouncedFilter.trim()}&rdquo;</>}
            {power && <> with a {powerTypeLabel(power)} minluck</>}.{' '}
            <button
              type="button"
              className="font-medium text-pink-700 underline underline-offset-2 hover:text-pink-900 dark:text-pink-300"
              onClick={() => {
                setFilter('');
                setPower(null);
              }}
            >
              Clear filters
            </button>
          </p>
        ) : (
          <ul>
            {filteredMice.map((mouse) => (
              <MouseRow key={mouse.id} mouse={mouse} power={power} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
