import { Link } from 'next-view-transitions';

import React from 'react';

import clsx from 'clsx';

import { ItemList } from '@/components/item-list';
import { SearchBar, SearchExamples } from '@/components/search/search-button';
import { TimersStrip } from '@/components/timers';

import { getResourcesByCategory, getPopularResources } from '@/lib/site-data';
import { getAllGameItems, getAllMice } from '@/lib/game-data';
import { itemImageUrl, locationImageUrl, mouseImageUrl } from '@/lib/image-urls';
import { pageMetadata } from '@/seo';
import { formatNumber } from '@/utils';

export const metadata = pageMetadata({
  title: 'MouseHunt Guides, Tools, and a Full Mouse & Item Database',
  description:
    'A community-built collection of MouseHunt guides, extensions, tools, and userscripts, plus every mouse and every item.',
  path: '/',
});

/** Real mice whose answer cards show off what search does. */
const searchExamples = ['Abominable Snow', 'Zombie', 'Relic Hunter'];

/** The essentials guide new hunters should start with. */
const BEGINNER_GUIDE = 'https://guide.mouse.rip/';

/** The lookups hunters reach for mid-session, one tap from the front door. */
const quickLookups = [
  {
    href: '/minlucks',
    name: 'Minlucks',
    description: 'Luck that guarantees a catch',
    image: mouseImageUrl('dragon'),
    mouse: true,
  },
  {
    href: '/relic-hunter',
    name: 'Relic Hunter',
    description: 'Where she is right now',
    image: mouseImageUrl('relic_hunter'),
    mouse: true,
  },
  {
    href: '/valour-rift-floors',
    name: 'Valour Rift floors',
    description: 'Which floor types come next',
    image: locationImageUrl('valour-rift'),
  },
  {
    href: '/essence-calculator',
    name: 'Essence calculator',
    description: 'What your essences craft into',
    image: '/images/essence/icuri.png',
  },
];

type DirectoryEntry = {
  href: string;
  name: string;
  description: string;
  count?: number;
  countLabel?: string;
  /** A few in-game portraits that show what's inside. */
  preview?: string[];
  /** Mouse portraits stay square; item art gets soft corners. */
  previewIsMice?: boolean;
};

type DirectoryGroup = {
  id: string;
  title: string;
  entries: DirectoryEntry[];
};

function directory(): DirectoryGroup[] {
  const resourceCount = (category: string) => getResourcesByCategory(category).length;

  return [
    {
      id: 'game-data',
      title: 'Game data',
      entries: [
        {
          href: '/mice',
          name: 'Mice',
          description: 'Stats, minlucks, and where to catch each one',
          count: getAllMice().length,
          countLabel: 'mice',
          preview: ['bark', 'cheesy_party', 'high_roller', 'dragon'].map((type) => mouseImageUrl(type)),
          previewIsMice: true,
        },
        {
          href: '/items',
          name: 'Items',
          description: 'Weapons, bases, charms, cheese, and chests',
          count: getAllGameItems().length,
          countLabel: 'items',
          preview: ['super_brie_cheese', 'gilded_trinket', 'bland_queso_cheese', 'brie_cheese'].map((type) =>
            itemImageUrl(type),
          ),
        },
      ],
    },
    {
      id: 'learn',
      title: 'Guides and tools',
      entries: [
        {
          href: '/guides',
          name: 'Guides',
          description: 'From your first hunt to endgame strategy',
          count: resourceCount('guide'),
          countLabel: 'guides',
        },
        {
          href: '/tools',
          name: 'Tools',
          description: 'Calculators, simulators, and planners',
          count: resourceCount('tool'),
          countLabel: 'tools',
        },
      ],
    },
    {
      id: 'community',
      title: 'Add-ons and sheets',
      entries: [
        {
          href: '/extensions',
          name: 'Extensions',
          description: 'Browser add-ons for the game',
          count: resourceCount('extension'),
          countLabel: 'extensions',
        },
        {
          href: '/userscripts',
          name: 'Userscripts',
          description: 'Small scripts that tweak the game page',
          count: resourceCount('userscript'),
          countLabel: 'userscripts',
        },
        {
          href: '/spreadsheets',
          name: 'Spreadsheets',
          description: 'Trackers and number-crunching sheets',
          count: resourceCount('spreadsheet'),
          countLabel: 'spreadsheets',
        },
      ],
    },
  ];
}

export default function Home() {
  const popular = getPopularResources();
  const groups = directory();

  return (
    <div className="mx-auto max-w-5xl">
      {/* ---------- Search first ---------- */}
      <section className="pt-2">
        <h1 className="text-3xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-4xl dark:text-white">
          MouseHunt guides, tools, and resources
        </h1>
        <p className="mt-3 max-w-2xl text-base/7 text-pretty text-zinc-600 sm:text-lg/8 dark:text-zinc-300">
          A community-built collection of guides, extensions, tools, spreadsheets, and userscripts. Everything you need
          to hunt smarter, in one place.
        </p>

        <div className="mt-6 max-w-2xl">
          <SearchBar />
          <p className="mt-3 text-sm text-pretty text-zinc-600 dark:text-zinc-400">
            Type a mouse to see its minluck, best cheese, and where to hunt it, right in the search box.
          </p>
          <SearchExamples examples={searchExamples} className="mt-2" />
        </div>

        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          New to MouseHunt?{' '}
          <a
            href={BEGINNER_GUIDE}
            className="font-medium text-pink-700 underline-offset-2 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300"
          >
            Start with the Essentials guide
          </a>
        </p>

        <nav aria-labelledby="lookups-heading" className="mt-8">
          <h2 id="lookups-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Quick lookups
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {quickLookups.map(({ href, name, description, image, mouse }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 transition-colors hover:border-pink-300 hover:bg-pink-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 sm:items-start sm:gap-3 sm:px-3.5 sm:py-3 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800 dark:hover:bg-pink-950/20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    decoding="async"
                    // Mouse art stays square, as it is in the game; other art gets soft corners.
                    className={clsx('size-8 shrink-0 object-cover sm:mt-0.5', !mouse && 'rounded-md')}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm/5 font-semibold text-zinc-900 group-hover:text-pink-700 dark:text-zinc-100 dark:group-hover:text-pink-300">
                      {name}
                    </span>
                    {/* Phones get the names alone, so the live timers stay on the first screen. */}
                    <span className="mt-0.5 hidden text-xs/5 text-zinc-600 sm:block dark:text-zinc-400">
                      {description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <TimersStrip className="mt-8" />
      </section>

      {/* ---------- Browse: the sidebar carries these from lg up, so only smaller screens get them here ---------- */}
      <nav aria-labelledby="browse-heading" className="mt-12 lg:hidden">
        <h2 id="browse-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Browse
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {groups
            .flatMap((group) => group.entries)
            .map(({ href, name, description, count, countLabel, preview, previewIsMice }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3.5 py-3 transition-colors hover:border-pink-300 hover:bg-pink-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800 dark:hover:bg-pink-950/20"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-zinc-900 group-hover:text-pink-700 dark:text-zinc-100 dark:group-hover:text-pink-300">
                        {name}
                      </span>
                      {count !== undefined && (
                        <span className="shrink-0 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                          {formatNumber(count)} {countLabel}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs/5 text-zinc-600 dark:text-zinc-400">{description}</span>
                    {preview && (
                      <span className="mt-2 flex -space-x-1.5" aria-hidden="true">
                        {preview.map((src) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src}
                            src={src}
                            alt=""
                            width={28}
                            height={28}
                            loading="lazy"
                            decoding="async"
                            className={clsx(
                              'size-7 bg-white object-cover ring-2 ring-white dark:bg-zinc-800 dark:ring-zinc-900',
                              !previewIsMice && 'rounded-md',
                            )}
                          />
                        ))}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      {/* ---------- Community favorites ---------- */}
      {popular.length > 0 && (
        <section aria-labelledby="favorites-heading" className="mt-12">
          <h2 id="favorites-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Community favorites
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Resources experienced hunters reach for most often.
          </p>
          <ItemList items={popular} headingLevel={3} />
        </section>
      )}
    </div>
  );
}
