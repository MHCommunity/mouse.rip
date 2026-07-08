import React from 'react';

import { Link } from 'next-view-transitions';

import { mouseSlug } from '@/lib/game-data';
import type { Mouse } from '@/types';

/** A responsive grid of mouse cards that link to each mouse's page. */
export function MouseGrid({ mice }: { mice: Mouse[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {mice.map((mouse) => (
        <li key={mouse.id}>
          <Link
            href={`/mice/${mouseSlug(mouse.type)}`}
            className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.mouse.rip/images/mice/thumbnail/${mouseSlug(mouse.type)}.png`}
              alt=""
              loading="lazy"
              className="size-10 shrink-0 rounded-md object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-zinc-100 dark:group-hover:text-emerald-300">
                {mouse.name}
              </div>
              {mouse.subgroup && (
                <div className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                  {mouse.subgroup}
                </div>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
