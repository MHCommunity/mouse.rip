import { Link } from 'next-view-transitions';

import React from 'react';

import { HomeIcon } from '@heroicons/react/20/solid';
import { Heading } from '@/components/heading';
import { SearchBar } from '@/components/search/search-button';
import { ToolCard, type Tint } from '@/components/tool-card';
import { itemImageUrl, mouseImageUrl } from '@/lib/image-urls';

export const metadata = {
  title: 'Page not found',
};

const sections: { href: string; title: string; description: string; image: string; tint: Tint }[] = [
  {
    href: '/mice',
    title: 'Mice',
    description: 'Every mouse, its minluck and best cheese',
    image: mouseImageUrl('glazed'),
    tint: 'pink',
  },
  {
    href: '/items',
    title: 'Items',
    description: 'Traps, cheese, charms and loot',
    image: itemImageUrl('super_brie_cheese'),
    tint: 'amber',
  },
  {
    href: '/minlucks',
    title: 'Minlucks',
    description: 'Luck that guarantees a catch',
    image: '/images/stats/luck.png',
    tint: 'green',
  },
  {
    href: '/guides',
    title: 'Guides',
    description: 'Where to go and how to get there',
    image: itemImageUrl('treasure_map_scroll_case_convertible'),
    tint: 'sky',
  },
  {
    href: '/tools',
    title: 'Tools',
    description: 'Calculators, planners and more',
    image: itemImageUrl('acronym_weapon'),
    tint: 'violet',
  },
  {
    href: '/extensions',
    title: 'Extensions and scripts',
    description: 'Add-ons that make the game easier',
    image: itemImageUrl('chrome_acronym_weapon'),
    tint: 'pink',
  },
];

export default function NotFound() {
  return (
    <div className="max-w-3xl py-12">
      <Heading>This page scurried off</Heading>
      <p className="mt-4 text-base/7 text-pretty text-zinc-600 dark:text-zinc-300">
        We couldn&apos;t find that page. Try searching for it instead.
      </p>

      <div className="mt-6 max-w-2xl">
        <SearchBar />
      </div>

      {/* A plain link: the shared Button's link mode breaks prerendering. */}
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-pink-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
      >
        <HomeIcon className="size-4" aria-hidden="true" />
        Back to home
      </Link>

      <nav aria-labelledby="jump-heading" className="mt-12">
        <h2 id="jump-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Or jump to
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <li key={section.href}>
              <ToolCard {...section} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
