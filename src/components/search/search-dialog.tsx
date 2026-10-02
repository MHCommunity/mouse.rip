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
import { ArrowUpRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import {
  GROUP_ORDER,
  getStaticSearchRecords,
  loadGameItemRecords,
  loadMouseRecords,
  searchRecords,
  type SearchGroup,
  type SearchRecord,
} from '@/lib/search';

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
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

  // Reset the query each time the dialog is dismissed.
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const records = useMemo(() => [...getStaticSearchRecords(), ...lazyRecords], [lazyRecords]);

  const results = useMemo(() => searchRecords(records, debouncedQuery), [records, debouncedQuery]);

  const grouped = useMemo(() => {
    const byGroup = new Map<SearchGroup, SearchRecord[]>();
    for (const record of results) {
      const list = byGroup.get(record.group) ?? [];
      list.push(record);
      byGroup.set(record.group, list);
    }
    return GROUP_ORDER.filter((group) => byGroup.has(group)).map((group) => [group, byGroup.get(group)!] as const);
  }, [results]);

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
              <MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" aria-hidden="true" />
              <ComboboxInput
                autoFocus
                className="w-full border-0 bg-transparent py-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-0 dark:text-white"
                placeholder="Search mice, items, locations, guides…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                displayValue={() => query}
              />
              <kbd className="hidden shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 sm:block dark:border-zinc-700 dark:bg-zinc-800">
                Esc
              </kbd>
            </div>

            {trimmed.length > 0 && results.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No results for &ldquo;{trimmed}&rdquo;.
              </div>
            )}

            {results.length > 0 && (
              <ComboboxOptions static className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
                {grouped.map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {group}
                    </div>
                    {items.map((record) => (
                      <ComboboxOption
                        key={record.id}
                        value={record}
                        className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 data-focus:bg-pink-50 dark:data-focus:bg-pink-950/40"
                      >
                        {record.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={record.image}
                            alt=""
                            className="size-9 shrink-0 rounded-md object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
                          />
                        ) : (
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                            <MagnifyingGlassIcon className="size-4" aria-hidden="true" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {record.title}
                            </span>
                            {record.external && (
                              <ArrowUpRightIcon className="size-3.5 shrink-0 text-zinc-400" aria-hidden="true" />
                            )}
                          </span>
                          {record.subtitle && (
                            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {record.subtitle}
                            </span>
                          )}
                        </span>
                        {record.badge && (
                          <span className="hidden shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium tabular-nums text-zinc-600 sm:block dark:bg-zinc-800 dark:text-zinc-300">
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
              <div className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Search across mice, items, locations, guides, tools, and more.
              </div>
            )}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
