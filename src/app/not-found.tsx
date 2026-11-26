import { Link } from 'next-view-transitions';

import React from 'react';

import {
  AcademicCapIcon,
  ArrowRightIcon,
  BoltIcon,
  HomeIcon,
  ScaleIcon,
  SwatchIcon,
  TableCellsIcon,
  WrenchIcon,
} from '@heroicons/react/20/solid';
import { CheeseIcon, MouseIcon } from '@/components/game-icons';
import { Heading } from '@/components/heading';
import { SearchBar } from '@/components/search/search-button';

export const metadata = {
  title: 'Page not found',
};

const sections = [
  { href: '/mice', label: 'Mice', icon: MouseIcon },
  { href: '/items', label: 'Items', icon: CheeseIcon },
  { href: '/minlucks', label: 'Minlucks', icon: ScaleIcon },
  { href: '/guides', label: 'Guides', icon: AcademicCapIcon },
  { href: '/extensions', label: 'Extensions', icon: BoltIcon },
  { href: '/tools', label: 'Tools', icon: WrenchIcon },
  { href: '/spreadsheets', label: 'Spreadsheets', icon: TableCellsIcon },
  { href: '/userscripts', label: 'Userscripts', icon: SwatchIcon },
];

export default function NotFound() {
  return (
    <div className="max-w-2xl py-12">
      <Heading>This page scurried off</Heading>
      <p className="mt-4 text-base/7 text-pretty text-zinc-600 dark:text-zinc-300">
        We couldn&apos;t find that page. Try searching for it instead.
      </p>

      <div className="mt-6">
        <SearchBar />
      </div>

      {/* A plain link: the shared Button's link mode breaks prerendering. */}
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-pink-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
      >
        <HomeIcon className="size-4" aria-hidden="true" />
        Back to home
      </Link>

      <nav aria-labelledby="jump-heading" className="mt-12">
        <h2 id="jump-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Or jump to
        </h2>
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {sections.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-pink-50/50 hover:text-pink-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-zinc-300 dark:hover:bg-pink-950/20 dark:hover:text-pink-300"
              >
                <Icon
                  className="size-5 text-zinc-500 group-hover:text-pink-600 dark:text-zinc-400 dark:group-hover:text-pink-400"
                  aria-hidden="true"
                />
                {label}
                <ArrowRightIcon
                  className="ml-auto size-4 text-zinc-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-pink-500 motion-reduce:transform-none dark:text-zinc-500"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
