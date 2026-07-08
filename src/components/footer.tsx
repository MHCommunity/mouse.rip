import React from 'react';

import { Link } from 'next-view-transitions';

const browse = [
  { href: '/guides', label: 'Guides' },
  { href: '/mice', label: 'Mice' },
  { href: '/items', label: 'Items' },
  { href: '/locations', label: 'Locations' },
  { href: '/minlucks', label: 'Minlucks' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/tools', label: 'Tools' },
];

const sources = [
  { href: 'https://mhct.win', label: 'MHCT' },
  { href: 'https://markethunt.win', label: 'Markethunt' },
  { href: 'https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki', label: 'MHWiki' },
  { href: 'https://dbgames.info/mousehunt/', label: 'dbgames' },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 pt-8 text-sm dark:border-zinc-800">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <div className="text-base font-semibold text-pink-800 dark:text-pink-200">mouse.rip</div>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            A community-built collection of MouseHunt guides, tools, and data. Not affiliated with
            HitGrab Inc.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Data sources
            </div>
            <ul className="mt-3 space-y-2">
              {sources.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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

      <div className="mt-8 border-t border-zinc-100 py-6 text-xs text-zinc-400 dark:border-zinc-800/60 dark:text-zinc-500">
        Mouse, item, and catch data from{' '}
        <a href="https://mhct.win" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
          MHCT
        </a>{' '}
        and marketplace prices from{' '}
        <a href="https://markethunt.win" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-600 dark:hover:text-zinc-300">
          Markethunt
        </a>
        . MouseHunt is a trademark of HitGrab Inc.
      </div>
    </footer>
  );
}
