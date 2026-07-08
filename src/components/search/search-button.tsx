'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { useSearch } from './search-context';

function useShortcutLabel() {
  const [label, setLabel] = useState('Ctrl K');
  useEffect(() => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
    setLabel(isMac ? '⌘ K' : 'Ctrl K');
  }, []);
  return label;
}

/** Full-width search box for the home page. Looks like an input, opens the palette. */
export function SearchBar({ className }: { className?: string }) {
  const { open } = useSearch();
  const shortcut = useShortcutLabel();

  return (
    <button
      type="button"
      onClick={open}
      className={clsx(
        'group flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-left shadow-sm transition duration-300 hover:border-pink-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800',
        className
      )}
    >
      <MagnifyingGlassIcon
        className="size-5 shrink-0 text-zinc-400 transition-colors group-hover:text-pink-500"
        aria-hidden="true"
      />
      <span className="flex-1 text-base text-zinc-400 dark:text-zinc-500">
        Search mice, locations, guides, tools…
      </span>
      <kbd className="hidden shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-400 sm:block dark:border-zinc-700 dark:bg-zinc-800">
        {shortcut}
      </kbd>
    </button>
  );
}

/** Compact search trigger for the sidebar / navbar. */
export function SearchButton({ className }: { className?: string }) {
  const { open } = useSearch();
  const shortcut = useShortcutLabel();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Search"
      className={clsx(
        'group flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:border-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600',
        className
      )}
    >
      <MagnifyingGlassIcon className="size-4 shrink-0 text-zinc-400" aria-hidden="true" />
      <span className="flex-1 text-zinc-400 dark:text-zinc-500">Search…</span>
      <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800">
        {shortcut}
      </kbd>
    </button>
  );
}
