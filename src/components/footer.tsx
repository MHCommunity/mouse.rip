import React from 'react';

import { Link } from 'next-view-transitions';

// Imported directly (it's tiny): the footer renders inside a client layout, so
// going through @/lib/game-data would pull server-only data into the bundle.
import dataUpdated from '@/data/generated/data-updated.json';

/** When scripts/update-data.js last refreshed the game data, as a plain date. */
const DATA_UPDATED = new Date(dataUpdated.updatedAt).toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const browse = [
  { href: '/guides', label: 'Guides' },
  { href: '/mice', label: 'Mice' },
  { href: '/items', label: 'Items' },
  { href: '/minlucks', label: 'Minlucks' },
  { href: '/tools', label: 'Tools' },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 pt-8 text-sm dark:border-zinc-800">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <div className="text-base font-semibold text-pink-800 dark:text-pink-200">mouse.rip</div>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            A community-built collection of MouseHunt guides, tools, and data. Not affiliated with HitGrab Inc.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Browse
            </div>
            <ul className="mt-3 space-y-2">
              {browse.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Community
            </div>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://github.com/MHCommunity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/mousehunt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Discord
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-zinc-100 py-6 text-xs text-zinc-600 dark:border-zinc-800/60 dark:text-zinc-400">
        Mouse, item, and catch data from{' '}
        <a
          href="https://mhct.win"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          MHCT
        </a>{' '}
        and{' '}
        <a
          href="https://tsitu.github.io/MH-Tools/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          MH-Tools
        </a>
        , marketplace prices from{' '}
        <a
          href="https://markethunt.win"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Markethunt
        </a>
        . Game data last updated {DATA_UPDATED}. MouseHunt is a trademark of HitGrab Inc.
      </div>
    </footer>
  );
}
