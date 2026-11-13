import { Link } from 'next-view-transitions';

import React from 'react';

import { ArrowUpRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

import { ItemList } from '@/components/item-list';
import { SearchBar, SearchExamples } from '@/components/search/search-button';
import { TimersStrip } from '@/components/timers';

import { getLocations, getResourcesByCategory, getPopularResources } from '@/lib/site-data';
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
  /** The section's sidebar colour, so phones learn the same colour code. */
  accent: Accent;
};

type Accent = 'emerald' | 'amber' | 'pink' | 'green' | 'cyan' | 'purple' | 'blue';

/** Full class strings per sidebar colour (Tailwind can't see classes built from parts). */
const ACCENTS: Record<Accent, { name: string; tile: string }> = {
  emerald: {
    name: 'text-emerald-800 dark:text-emerald-200',
    tile: 'hover:border-emerald-300 hover:bg-emerald-50/60 focus-visible:ring-emerald-500 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30',
  },
  amber: {
    name: 'text-amber-800 dark:text-amber-200',
    tile: 'hover:border-amber-300 hover:bg-amber-50/60 focus-visible:ring-amber-500 dark:hover:border-amber-800 dark:hover:bg-amber-950/30',
  },
  pink: {
    name: 'text-pink-800 dark:text-pink-200',
    tile: 'hover:border-pink-300 hover:bg-pink-50/60 focus-visible:ring-pink-500 dark:hover:border-pink-800 dark:hover:bg-pink-950/30',
  },
  green: {
    name: 'text-green-800 dark:text-green-200',
    tile: 'hover:border-green-300 hover:bg-green-50/60 focus-visible:ring-green-500 dark:hover:border-green-800 dark:hover:bg-green-950/30',
  },
  cyan: {
    name: 'text-cyan-800 dark:text-cyan-200',
    tile: 'hover:border-cyan-300 hover:bg-cyan-50/60 focus-visible:ring-cyan-500 dark:hover:border-cyan-800 dark:hover:bg-cyan-950/30',
  },
  purple: {
    name: 'text-purple-800 dark:text-purple-200',
    tile: 'hover:border-purple-300 hover:bg-purple-50/60 focus-visible:ring-purple-500 dark:hover:border-purple-800 dark:hover:bg-purple-950/30',
  },
  blue: {
    name: 'text-blue-800 dark:text-blue-200',
    tile: 'hover:border-blue-300 hover:bg-blue-50/60 focus-visible:ring-blue-500 dark:hover:border-blue-800 dark:hover:bg-blue-950/30',
  },
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
          accent: 'emerald',
          preview: ['bark', 'cheesy_party', 'high_roller', 'dragon'].map((type) => mouseImageUrl(type)),
          previewIsMice: true,
        },
        {
          href: '/items',
          name: 'Items',
          description: 'Weapons, bases, charms, cheese, and chests',
          count: getAllGameItems().length,
          countLabel: 'items',
          accent: 'amber',
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
          accent: 'pink',
        },
        {
          href: '/tools',
          name: 'Tools',
          description: 'Calculators, simulators, and planners',
          count: resourceCount('tool'),
          countLabel: 'tools',
          accent: 'green',
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
          accent: 'cyan',
        },
        {
          href: '/userscripts',
          name: 'Userscripts',
          description: 'Small scripts that tweak the game page',
          count: resourceCount('userscript'),
          countLabel: 'userscripts',
          accent: 'purple',
        },
        {
          href: '/spreadsheets',
          name: 'Spreadsheets',
          description: 'Trackers and number-crunching sheets',
          count: resourceCount('spreadsheet'),
          countLabel: 'spreadsheets',
          accent: 'blue',
        },
      ],
    },
  ];
}

export default function Home() {
  const popular = getPopularResources();
  const groups = directory();
  const regions = getLocations();
  const mouseCount = getAllMice().length;
  const itemCount = getAllGameItems().length;

  return (
    <div className="mx-auto max-w-5xl">
      {/* ---------- Search first ---------- */}
      <section className="pt-2">
        <h1 className="text-3xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-4xl dark:text-white">
          MouseHunt guides, tools, and resources
        </h1>
        <p className="mt-2 max-w-2xl text-base/7 text-pretty text-zinc-600 sm:text-lg/8 dark:text-zinc-300">
          Minlucks, cheese, and drops for {formatNumber(mouseCount)} mice and {formatNumber(itemCount)} items, plus the
          community&rsquo;s best guides and tools.
        </p>

        <div className="mt-5 max-w-2xl">
          <SearchBar />
          <SearchExamples
            examples={searchExamples}
            label="Try a mouse for its minluck and best cheese:"
            className="mt-3"
          />
        </div>

        <p className="mt-4 text-sm text-pretty text-zinc-600 dark:text-zinc-400">
          New to MouseHunt? {/* Opens in a new tab, like the same guide's card under Community favorites. */}
          <a
            href={BEGINNER_GUIDE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium text-pink-700 underline-offset-2 hover:underline focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300"
          >
            Start with the Essentials guide
            <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>

        <nav aria-labelledby="lookups-heading" className="mt-7">
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
                    {/* Phones get the names alone, so the tiles stay short and the timers come sooner. */}
                    <span className="mt-0.5 hidden text-xs/5 text-zinc-600 sm:block dark:text-zinc-400">
                      {description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <TimersStrip className="mt-7" />
      </section>

      {/* ---------- Browse: the sidebar carries these from lg up, so only smaller screens get them here ---------- */}
      <nav aria-labelledby="browse-heading" className="mt-12 lg:hidden">
        <h2 id="browse-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Browse
        </h2>
        <div className="mt-3 space-y-6">
          {groups.map((group) => (
            <div key={group.id}>
              <h3 id={`${group.id}-heading`} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {group.title}
              </h3>
              <ul aria-labelledby={`${group.id}-heading`} className="mt-2 grid gap-2 sm:grid-cols-2">
                {group.entries.map(({ href, name, description, count, countLabel, preview, previewIsMice, accent }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={clsx(
                        'group flex h-full items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3.5 py-3 transition-colors focus:outline-none focus-visible:ring-2 dark:border-zinc-800 dark:bg-zinc-900',
                        ACCENTS[accent].tile,
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={clsx('text-sm font-semibold', ACCENTS[accent].name)}>{name}</span>
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
                                  !previewIsMice && 'rounded-md dark:brightness-90',
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
            </div>
          ))}

          {/* Phones have no sidebar, so this is their way into the location pages. Folded, since it's 14 regions long. */}
          <details className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3.5 py-3 hover:bg-pink-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:hover:bg-pink-950/20 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Locations</span>
                <span className="mt-0.5 block text-xs/5 text-zinc-600 dark:text-zinc-400">
                  Mice, loot, and guides for every location, by region
                </span>
              </span>
              <ChevronDownIcon
                className="size-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180 motion-reduce:transition-none dark:text-zinc-400"
                aria-hidden="true"
              />
            </summary>
            <ul className="flex flex-wrap gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
              {regions.map((region) => (
                <li key={region.id}>
                  <Link
                    href={`/regions/${region.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition-colors hover:border-pink-300 hover:bg-pink-50/50 hover:text-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 sm:min-h-9 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-pink-800 dark:hover:bg-pink-950/20 dark:hover:text-pink-300"
                  >
                    {region.name}
                    <span className="text-xs font-normal tabular-nums text-zinc-600 dark:text-zinc-400">
                      {region.locations.length}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </nav>

      {/* ---------- Community favorites ---------- */}
      {popular.length > 0 && (
        <section aria-labelledby="favorites-heading" className="mt-12">
          <h2 id="favorites-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Community favorites
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Hand-picked resources that experienced hunters vouch for.
          </p>
          <ItemList items={popular} headingLevel={3} compact />
        </section>
      )}
    </div>
  );
}
