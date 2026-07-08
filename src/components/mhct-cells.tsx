'use client';

import React from 'react';

import { Link } from 'next-view-transitions';

import lookup from '@/data/generated/name-lookup.json';

const cheeseLookup = lookup.cheese as Record<string, string>;
const locationLookup = lookup.location as Record<string, string>;

const linkClass =
  'text-zinc-700 underline decoration-zinc-300 decoration-dotted underline-offset-2 hover:text-zinc-900 hover:decoration-zinc-500 dark:text-zinc-300 dark:hover:text-white';

/** A cheese name, linked to its item page when we can resolve it. */
export function CheeseCell({ cheese }: { cheese: string }) {
  const key = cheese.trim().toLowerCase();
  const slug = cheeseLookup[key] ?? cheeseLookup[`${key} cheese`];
  if (!slug) return <span className="text-zinc-600 dark:text-zinc-300">{cheese}</span>;
  return (
    <Link href={`/items/${slug}`} className={linkClass}>
      {cheese}
    </Link>
  );
}

/** A location name (with optional stage), linked to its location page when known. */
export function LocationCell({ location, stage }: { location: string; stage?: string | null }) {
  const slug = locationLookup[location.trim().toLowerCase()];
  return (
    <span className="text-zinc-800 dark:text-zinc-200">
      {slug ? (
        <Link href={`/locations/${slug}`} className={linkClass}>
          {location}
        </Link>
      ) : (
        location
      )}
      {stage && <span className="text-zinc-400 dark:text-zinc-500"> · {stage}</span>}
    </span>
  );
}
