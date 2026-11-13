'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React, { useState, useSyncExternalStore } from 'react';

import { useSearch } from './search-context';

const subscribeNoop = () => () => {};

// The platform never changes, so there's nothing to subscribe to; the server
// snapshot keeps hydration matching before the client label takes over.
function useShortcutLabel() {
  return useSyncExternalStore(
    subscribeNoop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'),
    () => 'Ctrl K',
  );
}

/**
 * Search field for the home page. It's a real input, so a tap brings up the
 * keyboard straight away; the first keystroke hands the text to the palette.
 */
export function SearchBar({ className }: { className?: string }) {
  const { open, preload, isOpen } = useSearch();
  const shortcut = useShortcutLabel();
  const [value, setValue] = useState('');

  // Once the palette closes, the text it took over is spent.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setValue('');
  }

  return (
    <label
      className={clsx(
        'group flex w-full cursor-text items-center gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm transition duration-200 hover:border-pink-300 hover:shadow-md focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800 dark:focus-within:border-pink-700',
        className,
      )}
    >
      <MagnifyingGlassIcon
        className="size-5 shrink-0 text-zinc-500 transition-colors group-hover:text-pink-600 group-focus-within:text-pink-600 dark:text-zinc-400"
        aria-hidden="true"
      />
      <span className="sr-only">Search mice, items, locations, guides, and tools</span>
      <input
        type="search"
        value={value}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        aria-haspopup="dialog"
        placeholder="Search mice, items, guides…"
        onFocus={preload}
        onChange={(event) => {
          setValue(event.target.value);
          if (event.target.value) open(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            open(value);
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-base text-zinc-900 placeholder:text-zinc-500 focus:outline-none dark:text-white dark:placeholder:text-zinc-400 [&::-webkit-search-cancel-button]:hidden"
      />
      <kbd className="hidden shrink-0 rounded-md border whitespace-nowrap border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-500 pointer-fine:block dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        {shortcut}
      </kbd>
    </label>
  );
}

/** Compact search trigger for the sidebar / navbar. */
export function SearchButton({ className }: { className?: string }) {
  const { open } = useSearch();
  const shortcut = useShortcutLabel();

  return (
    <button
      type="button"
      onClick={() => open()}
      aria-label="Search"
      className={clsx(
        'group flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:border-pink-300 hover:shadow-md active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-pink-800',
        className,
      )}
    >
      <MagnifyingGlassIcon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
      <span className="flex-1 text-zinc-500 dark:text-zinc-400">Search…</span>
      <kbd className="hidden shrink-0 rounded border whitespace-nowrap border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 pointer-fine:block dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        {shortcut}
      </kbd>
    </button>
  );
}
