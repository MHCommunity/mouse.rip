'use client';

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from '@headlessui/react';
import {
  AcademicCapIcon,
  ArrowUpRightIcon,
  BoltIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  SwatchIcon,
  TableCellsIcon,
  TrophyIcon,
  WrenchIcon,
} from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { ColorScaleBadge } from '@/components/color-scale-badge';
import { GameImage } from '@/components/game-image';
import { POWER_TYPE_CHIP, powerTypeLabel } from '@/lib/power-types';
import {
  getStaticSearchRecords,
  loadGameItemRecords,
  loadMouseRecords,
  searchRecords,
  type SearchGroup,
  type SearchKind,
  type SearchRecord,
} from '@/lib/search';

/** Shown before anything is typed: the lookups people open search to reach. */
const QUICK_LINKS = ['/minlucks', '/relic-hunter', '/valour-rift-floors', '/essence-calculator', '/guides'];

/** Records without game art get the same icon the sidebar uses for their section. */
const KIND_ICONS: Partial<Record<SearchKind, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {
  guide: AcademicCapIcon,
  extension: BoltIcon,
  tool: WrenchIcon,
  spreadsheet: TableCellsIcon,
  userscript: SwatchIcon,
  title: TrophyIcon,
  page: DocumentTextIcon,
};

/** MHCT reports rates in hundredths of a percent. */
function formatRate(rate: number): string {
  return `${(rate / 100).toFixed(2)}%`;
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

export function SearchDialog({
  open,
  initialQuery = '',
  onClose,
}: {
  open: boolean;
  initialQuery?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(open ? initialQuery : '');
  const [lazyRecords, setLazyRecords] = useState<SearchRecord[]>([]);
  const debouncedQuery = useDebouncedValue(query, 120);

  // Pull in the (large) mouse and item indexes the first time search is opened.
  // allSettled, not all: if one index fails to load, keep the one that did —
  // search falls back to the static records only for the half that's missing.
  useEffect(() => {
    if (!open) return;
    let active = true;
    Promise.allSettled([loadMouseRecords(), loadGameItemRecords()]).then((results) => {
      if (!active) return;
      const loaded = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
      if (loaded.length > 0) setLazyRecords(loaded);
    });
    return () => {
      active = false;
    };
  }, [open]);

  // Start from whatever was typed before opening; reset when dismissed.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setQuery(open ? initialQuery : '');
  }

  // Keystrokes held while the palette was still loading arrive as a longer initialQuery.
  const [lastInitialQuery, setLastInitialQuery] = useState(initialQuery);
  if (initialQuery !== lastInitialQuery) {
    setLastInitialQuery(initialQuery);
    if (open) setQuery(initialQuery);
  }

  const records = useMemo(() => [...getStaticSearchRecords(), ...lazyRecords], [lazyRecords]);

  const results = useMemo(() => searchRecords(records, debouncedQuery), [records, debouncedQuery]);

  // When the best match is a mouse, answer in place: minluck, where to hunt, weaknesses.
  const answer = results[0]?.mouse ? results[0] : null;

  // Groups appear in the order of their best match, so "beginner guide" leads with guides.
  const grouped = useMemo(() => {
    const byGroup = new Map<SearchGroup, SearchRecord[]>();
    for (const record of results) {
      if (record === answer) continue;
      const list = byGroup.get(record.group) ?? [];
      list.push(record);
      byGroup.set(record.group, list);
    }
    // The answer's siblings (other zombies after Zombie Mouse) read best straight after it.
    return [...byGroup.entries()].sort(([a], [b]) => Number(b === answer?.group) - Number(a === answer?.group));
  }, [results, answer]);

  const quickLinks = useMemo(
    () =>
      QUICK_LINKS.map((href) => getStaticSearchRecords().find((record) => record.href === href)).filter(
        (record): record is SearchRecord => Boolean(record),
      ),
    [],
  );

  function handleSelect(record: SearchRecord | null) {
    if (!record) return;
    onClose();
    if (record.external) {
      window.open(record.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(record.href);
    }
  }

  const trimmed = debouncedQuery.trim();

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in dark:bg-black/60"
      />

      <div className="fixed inset-0 overflow-y-auto p-4 pt-[12vh] sm:pt-[16vh]">
        <DialogPanel
          transition
          className="mx-auto max-w-xl transform overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-950/5 transition-all data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in dark:bg-zinc-900 dark:ring-white/10"
        >
          <Combobox<SearchRecord> immediate onChange={handleSelect}>
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
              <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
              <ComboboxInput
                autoFocus
                className="w-full border-0 bg-transparent py-4 text-base text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-zinc-400"
                placeholder="Search mice, items, locations, guides…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  // The combobox would spend the first Escape closing its option list; close the palette instead.
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    onClose();
                  }
                }}
                displayValue={() => query}
              />
              <kbd className="hidden shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 pointer-fine:block dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                Esc
              </kbd>
              <button
                type="button"
                onClick={onClose}
                className="-mr-1 shrink-0 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 pointer-fine:hidden dark:text-zinc-300"
              >
                Cancel
              </button>
            </div>

            {trimmed.length > 0 && results.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
                <p>No results for &ldquo;{trimmed}&rdquo;.</p>
                <p className="mt-1">
                  Check the spelling, try part of the name, or browse{' '}
                  <Link
                    href="/mice"
                    onClick={onClose}
                    className="font-medium text-pink-700 underline-offset-2 hover:underline dark:text-pink-400"
                  >
                    all mice
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/items"
                    onClick={onClose}
                    className="font-medium text-pink-700 underline-offset-2 hover:underline dark:text-pink-400"
                  >
                    all items
                  </Link>
                  .
                </p>
              </div>
            )}

            {results.length > 0 && (
              <ComboboxOptions static className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
                {answer?.mouse && (
                  <ComboboxOption
                    value={answer}
                    className="group mb-2 block cursor-pointer rounded-xl border border-zinc-200 p-3 data-focus:border-pink-300 data-focus:bg-pink-50/60 dark:border-zinc-800 dark:data-focus:border-pink-800 dark:data-focus:bg-pink-950/30"
                  >
                    <div className="flex items-start gap-3">
                      {answer.image && (
                        <GameImage
                          src={answer.image}
                          className="size-12 shrink-0 rounded-lg object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-semibold text-zinc-900 dark:text-white">{answer.title}</span>
                          <span className="shrink-0 text-xs font-medium text-pink-700 dark:text-pink-300">
                            Open page →
                          </span>
                        </div>
                        {answer.subtitle && (
                          <div className="truncate text-xs text-zinc-600 dark:text-zinc-400">{answer.subtitle}</div>
                        )}
                      </div>
                    </div>

                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-zinc-600 dark:text-zinc-400">Minluck</dt>
                        <dd className="mt-1 space-y-1">
                          {answer.mouse.minlucks.length === 0 ? (
                            <span className="text-zinc-600 dark:text-zinc-400">No data</span>
                          ) : (
                            answer.mouse.minlucks.slice(0, 3).map((row) => (
                              <div key={row.value} className="flex items-center gap-2">
                                <ColorScaleBadge value={row.value} />
                                <span className="text-zinc-800 dark:text-zinc-200">{row.label}</span>
                              </div>
                            ))
                          )}
                        </dd>
                      </div>
                      {answer.mouse.best && (
                        <div>
                          <dt className="text-xs text-zinc-600 dark:text-zinc-400">Best attraction</dt>
                          <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
                            <span className="font-semibold tabular-nums text-zinc-900 dark:text-white">
                              {formatRate(answer.mouse.best.rate)}
                            </span>{' '}
                            with {answer.mouse.best.cheese}
                            <span className="block text-zinc-600 dark:text-zinc-400">
                              {answer.mouse.best.location}
                              {answer.mouse.best.stage ? ` · ${answer.mouse.best.stage}` : ''}
                            </span>
                          </dd>
                        </div>
                      )}
                    </dl>

                    {answer.mouse.weakTo.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">Weak to</span>
                        {answer.mouse.weakTo.map((type) => (
                          <span
                            key={type}
                            className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium ${POWER_TYPE_CHIP[type] ?? ''}`}
                          >
                            {powerTypeLabel(type)}
                          </span>
                        ))}
                      </div>
                    )}
                  </ComboboxOption>
                )}
                {grouped.map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <div className="px-2 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">{group}</div>
                    {items.map((record) => (
                      <ComboboxOption
                        key={record.id}
                        value={record}
                        className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 data-focus:bg-pink-50 dark:data-focus:bg-pink-950/40"
                      >
                        {record.image ? (
                          <GameImage
                            src={record.image}
                            className="size-9 shrink-0 rounded-md object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
                          />
                        ) : (
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {React.createElement(KIND_ICONS[record.kind] ?? MagnifyingGlassIcon, {
                              className: 'size-4',
                              'aria-hidden': true,
                            })}
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {record.title}
                            </span>
                            {record.external && (
                              <ArrowUpRightIcon className="size-3.5 shrink-0 text-zinc-500" aria-hidden="true" />
                            )}
                          </span>
                          {record.subtitle && (
                            <span className="block truncate text-xs text-zinc-600 dark:text-zinc-400">
                              {record.subtitle}
                            </span>
                          )}
                          {/* On phones the badge (e.g. minluck) sits under the title instead of beside it. */}
                          {record.badge && (
                            <span className="mt-1 inline-block rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-zinc-700 sm:hidden dark:bg-zinc-800 dark:text-zinc-300">
                              {record.badge}
                            </span>
                          )}
                        </span>
                        {record.badge && (
                          <span className="hidden shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium tabular-nums text-zinc-700 sm:block dark:bg-zinc-800 dark:text-zinc-300">
                            {record.badge}
                          </span>
                        )}
                      </ComboboxOption>
                    ))}
                  </div>
                ))}
              </ComboboxOptions>
            )}

            {trimmed.length === 0 && (
              <ComboboxOptions static className="p-2">
                <div className="px-2 pt-1.5 pb-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Search mice, items, locations, guides, and tools. Try &ldquo;zombie&rdquo; or &ldquo;beginner
                  guide&rdquo;.
                </div>
                <div className="px-2 pt-2 pb-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Quick lookups
                </div>
                {quickLinks.map((record) => (
                  <ComboboxOption
                    key={record.id}
                    value={record}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm data-focus:bg-pink-50 dark:data-focus:bg-pink-950/40"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{record.title}</span>
                    <span className="truncate text-xs text-zinc-600 dark:text-zinc-400">{record.subtitle}</span>
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            )}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
