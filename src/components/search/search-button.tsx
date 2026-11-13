'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';

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
 * Closing the palette (Esc, Cancel) leaves the text here, so a typo isn't a retype.
 */
export function SearchBar({ className }: { className?: string }) {
  const { open, preload, isOpen, closedQuery } = useSearch();
  const shortcut = useShortcutLabel();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // When the palette closes, take back whatever was typed in it.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (!isOpen) setValue(closedQuery);
  }

  // Typing anywhere on the page starts a search, so desktop visitors can type at once
  // without the field grabbing focus on load (which would skip the skip link and
  // start screen readers past the heading). Touch screens never see a keypress here.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1 || event.key === ' ' || event.key === '/') return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.closest('input, textarea, select, [contenteditable="true"]') || target.closest('[role="dialog"]'))
      )
        return;
      event.preventDefault();
      inputRef.current?.focus({ preventScroll: true });
      setValue(event.key);
      open(event.key);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

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
        ref={inputRef}
        type="search"
        value={value}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        aria-haspopup="dialog"
        placeholder="Type a mouse, item, or guide…"
        onFocus={preload}
        onClick={() => {
          if (value) open(value);
        }}
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

/**
 * Real mice to try, so the in-place answer (minluck, best cheese, weaknesses)
 * can be seen before anyone knows to type for it.
 */
export function SearchExamples({
  examples,
  label = 'Try',
  className,
}: {
  examples: string[];
  label?: string;
  className?: string;
}) {
  const { open, preload } = useSearch();

  return (
    <p
      className={clsx(
        'flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400',
        className,
      )}
    >
      <span>{label}</span>
      {examples.map((name, index) => (
        <button
          key={name}
          type="button"
          onPointerEnter={preload}
          onFocus={preload}
          onClick={() => open(name)}
          // Two fit on one line at phone width; the rest join from sm up.
          className={clsx(
            index >= 2 && 'max-sm:hidden',
            'inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-1 font-medium pointer-coarse:min-h-11 pointer-coarse:px-3 text-zinc-800 transition-colors hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-pink-800 dark:hover:bg-pink-950/20 dark:hover:text-pink-300',
          )}
        >
          {name}
        </button>
      ))}
    </p>
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
        'group flex shrink-0 items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:border-pink-300 hover:shadow-md active:translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-pink-800',
        className,
      )}
    >
      <MagnifyingGlassIcon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
      <span className="flex-1 text-zinc-600 max-[359px]:sr-only dark:text-zinc-400">Search…</span>
      <kbd className="hidden shrink-0 rounded border whitespace-nowrap border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 pointer-fine:block dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        {shortcut}
      </kbd>
    </button>
  );
}
