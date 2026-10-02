import { Link } from 'next-view-transitions';

import React from 'react';

import {
  AcademicCapIcon,
  ArrowRightIcon,
  BoltIcon,
  HomeIcon,
  SwatchIcon,
  TableCellsIcon,
  WrenchIcon,
} from '@heroicons/react/20/solid';
import { CheeseIcon, MouseIcon } from '@/components/game-icons';
import { Heading } from '@/components/heading';

export const metadata = {
  title: 'Page not found',
};

const sections = [
  { href: '/mice', label: 'Mice', icon: MouseIcon },
  { href: '/items', label: 'Items', icon: CheeseIcon },
  { href: '/guides', label: 'Guides', icon: AcademicCapIcon },
  { href: '/extensions', label: 'Extensions', icon: BoltIcon },
  { href: '/tools', label: 'Tools', icon: WrenchIcon },
  { href: '/spreadsheets', label: 'Spreadsheets', icon: TableCellsIcon },
  { href: '/userscripts', label: 'Userscripts', icon: SwatchIcon },
];

export default function NotFound() {
  return (
    <div className="py-12">
      <p className="font-mono text-sm font-semibold tracking-widest text-pink-600 dark:text-pink-400">404</p>
      <Heading className="mt-3">This page scurried off</Heading>
      <p className="mt-4 text-base/7 text-pretty text-zinc-600 dark:text-zinc-300">
        We couldn&apos;t find the page you were looking for. It may have moved, or the link might be out of date.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-pink-500 active:scale-[.98] motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
      >
        <HomeIcon className="size-4" aria-hidden="true" />
        Back to home
      </Link>

      <div className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Or jump to</h2>
        <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
          {sections.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-3 py-3 text-sm font-medium text-zinc-700 transition-colors hover:text-pink-700 focus:outline-none focus-visible:text-pink-700 dark:text-zinc-300 dark:hover:text-pink-300"
              >
                <Icon
                  className="size-5 text-zinc-400 group-hover:text-pink-600 dark:group-hover:text-pink-400"
                  aria-hidden="true"
                />
                {label}
                <ArrowRightIcon
                  className="ml-auto size-4 text-zinc-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-pink-500 dark:text-zinc-600"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
