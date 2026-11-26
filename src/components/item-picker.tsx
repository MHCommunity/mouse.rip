'use client';

import * as Headless from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/16/solid';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';

import { GameImage } from '@/components/game-image';

export interface PickerOption {
  value: string;
  name: string;
  image?: string;
  /** A short note beside the name, such as a power type. */
  hint?: string;
}

/** Shown in the list before anything is typed; more than this and the list asks for a search instead. */
const LIST_LIMIT = 80;

/**
 * Pick one item from a long list by typing part of its name, with the game's art beside each.
 * Built on Headless UI's Combobox, so it works with a keyboard and screen readers.
 */
export function ItemPicker({
  label,
  options,
  value,
  onChange,
  placeholder = 'Type to search',
  clearable = false,
  clearLabel = 'None',
}: {
  label: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Offer a way back to nothing picked, such as no charm. */
  clearable?: boolean;
  clearLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value) ?? null;

  const { filtered, hidden } = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = needle ? options.filter((option) => option.name.toLowerCase().includes(needle)) : options;
    return { filtered: matches.slice(0, LIST_LIMIT), hidden: Math.max(0, matches.length - LIST_LIMIT) };
  }, [options, query]);

  return (
    <Headless.Field className="flex flex-col gap-1.5">
      <Headless.Label className="text-sm font-medium text-zinc-950 dark:text-white">{label}</Headless.Label>
      <Headless.Combobox
        value={selected}
        onChange={(option: PickerOption | null) => {
          onChange(option?.value ?? '');
          setQuery('');
        }}
        onClose={() => setQuery('')}
        by="value"
        immediate
      >
        <div className="relative">
          {selected?.image && (
            <GameImage
              src={selected.image}
              width={24}
              height={24}
              className="pointer-events-none absolute top-1/2 left-2.5 size-6 -translate-y-1/2 rounded object-contain"
            />
          )}
          <Headless.ComboboxInput
            className={clsx(
              'w-full rounded-xl border border-zinc-950/10 bg-white py-2.5 pr-16 text-base/6 text-zinc-950 shadow-xs placeholder:text-zinc-500 hover:border-zinc-950/20 focus:border-pink-500 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 sm:py-2 sm:text-sm/6 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-400 dark:hover:border-white/20',
              selected?.image ? 'pl-10' : 'pl-3',
            )}
            displayValue={(option: PickerOption | null) => option?.name ?? ''}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-1 flex items-center">
            {clearable && selected && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-zinc-400 dark:hover:text-white"
              >
                <XMarkIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Clear {label.toLowerCase()}</span>
              </button>
            )}
            <Headless.ComboboxButton className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              <ChevronUpDownIcon className="size-4" aria-hidden="true" />
              <span className="sr-only">Show all</span>
            </Headless.ComboboxButton>
          </div>
        </div>
        <Headless.ComboboxOptions
          anchor="bottom start"
          transition
          className="z-50 mt-1 max-h-80 w-(--input-width) min-w-64 overflow-y-auto rounded-xl bg-white p-1 shadow-lg ring-1 ring-zinc-950/10 transition duration-100 ease-out empty:invisible data-closed:opacity-0 dark:bg-zinc-900 dark:ring-white/10"
        >
          {clearable && !query && (
            <Headless.ComboboxOption
              value={null}
              className="flex cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 select-none data-focus:bg-pink-50 data-focus:text-pink-900 dark:text-zinc-400 dark:data-focus:bg-pink-950/50 dark:data-focus:text-pink-100"
            >
              {clearLabel}
            </Headless.ComboboxOption>
          )}
          {filtered.map((option) => (
            <Headless.ComboboxOption
              key={option.value}
              value={option}
              className="group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-900 select-none data-focus:bg-pink-50 data-focus:text-pink-900 dark:text-zinc-100 dark:data-focus:bg-pink-950/50 dark:data-focus:text-pink-100"
            >
              {option.image ? (
                <GameImage
                  src={option.image}
                  width={24}
                  height={24}
                  className="size-6 shrink-0 rounded object-contain"
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate">{option.name}</span>
              {option.hint && <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">{option.hint}</span>}
              <CheckIcon className="invisible size-4 shrink-0 group-data-selected:visible" aria-hidden="true" />
            </Headless.ComboboxOption>
          ))}
          {filtered.length === 0 && (
            <div className="px-2.5 py-2 text-sm text-zinc-600 dark:text-zinc-400">Nothing matches “{query}”.</div>
          )}
          {hidden > 0 && (
            <div className="px-2.5 py-2 text-xs text-zinc-500 dark:text-zinc-400">
              {hidden} more. Type to narrow it down.
            </div>
          )}
        </Headless.ComboboxOptions>
      </Headless.Combobox>
    </Headless.Field>
  );
}
