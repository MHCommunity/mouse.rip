'use client';

import React, { useState } from 'react';

import { Input } from '@/components/input';
import { Link } from '@/components/link';
import { locationImageUrl } from '@/lib/image-urls';

export interface RiddleLocation {
  envId: string;
  name: string;
  /** The on-site location page, when there is one. */
  href: string | null;
  hints: string[];
}

/** Lowercase words, without the punctuation riddles are full of. */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Every location's riddles, with a box to narrow them to the ones that share words with today's. */
export function RiddleFinder({ locations }: { locations: RiddleLocation[] }) {
  const [query, setQuery] = useState('');
  const terms = words(query);
  const matches = (text: string) => {
    const haystack = text.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  };
  const shown = terms.length
    ? locations
        .map((location) => ({
          ...location,
          // A location's name matching keeps all its riddles; otherwise only the riddles that match.
          hints: matches(location.name) ? location.hints : location.hints.filter(matches),
        }))
        .filter((location) => location.hints.length > 0)
    : locations;

  return (
    <>
      <label className="mt-4 block max-w-md text-sm font-medium text-zinc-950 dark:text-white">
        Find a riddle
        <Input
          type="search"
          className="mt-1.5"
          placeholder="Type a few words from the riddle, e.g. crown"
          value={query}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </label>
      <p className="sr-only" aria-live="polite">
        {terms.length ? `${shown.length} location${shown.length === 1 ? '' : 's'} match` : ''}
      </p>

      {shown.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
          No riddle has all of those words. Try fewer, or just one.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shown.map((location) => (
            <div
              key={location.envId}
              className="group flex flex-col rounded-2xl bg-white p-5 shadow-xs ring-1 ring-zinc-200 transition-shadow hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={locationImageUrl(location.envId)}
                  alt=""
                  className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
                />
                <h3 className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {location.href ? (
                    <Link
                      href={location.href}
                      className="inline-block py-0.5 transition-colors hover:text-pink-700 dark:hover:text-pink-300"
                    >
                      {location.name}
                    </Link>
                  ) : (
                    location.name
                  )}
                </h3>
              </div>
              <ul className="mt-4 space-y-2">
                {location.hints.map((hint) => (
                  <li
                    key={hint}
                    className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-pretty text-zinc-600 italic ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:text-zinc-300 dark:ring-white/5"
                  >
                    “{hint}”
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
