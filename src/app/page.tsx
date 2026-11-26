import { Link } from 'next-view-transitions';

import React from 'react';

import { ArrowUpRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

import { ItemList } from '@/components/item-list';
import { SearchBar, SearchExamples } from '@/components/search/search-button';
import { TINTS, type Tint } from '@/components/tool-card';
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
const searchExamples = ['Glazy', 'Abominable Snow', 'Zombie', 'Relic Hunter'];

/** The essentials guide new hunters should start with. */
const BEGINNER_GUIDE = 'https://guide.mouse.rip/';

/** The tools hunters reach for mid-session, one tap from the front door. */
const quickLookups = [
  {
    href: '/catch-rate-estimator',
    name: 'Catch rate estimator',
    description: 'Your odds against every mouse',
    image: itemImageUrl('acronym_weapon'),
    tint: 'pink',
  },
  {
    href: '/best-setup',
    name: 'Best setup',
    description: 'The trap that catches the most',
    image: itemImageUrl('infinite_dark_magic_mirror_weapon'),
    tint: 'violet',
  },
  {
    href: '/minlucks',
    name: 'Minlucks',
    description: 'Luck that guarantees a catch',
    // The game's own luck stat icon, from the trap stats on the Camp page.
    image: '/images/stats/luck.png',
    tint: 'green',
  },
  {
    href: '/relic-hunter',
    name: 'Relic Hunter',
    description: 'Where she is right now',
    image: mouseImageUrl('relic_hunter'),
    tint: 'violet',
  },
  {
    href: '/valour-rift-floors',
    name: 'Valour Rift floors',
    description: 'Which floor types come next',
    image: locationImageUrl('valour-rift'),
    tint: 'sky',
  },
  {
    href: '/essence-calculator',
    name: 'Essence calculator',
    description: 'What your essences craft into',
    image: '/images/essence/icuri.png',
    tint: 'pink',
  },
] satisfies { href: string; name: string; description: string; image: string; tint: Tint }[];

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
    tile: 'hover:ring-emerald-300 hover:bg-emerald-50/60 focus-visible:ring-emerald-500 dark:hover:ring-emerald-800 dark:hover:bg-emerald-950/30',
  },
  amber: {
    name: 'text-amber-800 dark:text-amber-200',
    tile: 'hover:ring-amber-300 hover:bg-amber-50/60 focus-visible:ring-amber-500 dark:hover:ring-amber-800 dark:hover:bg-amber-950/30',
  },
  pink: {
    name: 'text-pink-800 dark:text-pink-200',
    tile: 'hover:ring-pink-300 hover:bg-pink-50/60 focus-visible:ring-pink-500 dark:hover:ring-pink-800 dark:hover:bg-pink-950/30',
  },
  green: {
    name: 'text-green-800 dark:text-green-200',
    tile: 'hover:ring-green-300 hover:bg-green-50/60 focus-visible:ring-green-500 dark:hover:ring-green-800 dark:hover:bg-green-950/30',
  },
  cyan: {
    name: 'text-cyan-800 dark:text-cyan-200',
    tile: 'hover:ring-cyan-300 hover:bg-cyan-50/60 focus-visible:ring-cyan-500 dark:hover:ring-cyan-800 dark:hover:bg-cyan-950/30',
  },
  purple: {
    name: 'text-purple-800 dark:text-purple-200',
    tile: 'hover:ring-purple-300 hover:bg-purple-50/60 focus-visible:ring-purple-500 dark:hover:ring-purple-800 dark:hover:bg-purple-950/30',
  },
  blue: {
    name: 'text-blue-800 dark:text-blue-200',
    tile: 'hover:ring-blue-300 hover:bg-blue-50/60 focus-visible:ring-blue-500 dark:hover:ring-blue-800 dark:hover:bg-blue-950/30',
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
          description: 'Strategy and how-tos from other hunters',
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
      <section className="pt-2">
        <h1 className="text-3xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-4xl dark:text-white">
          MouseHunt guides, tools, and resources
        </h1>
        <p className="mt-2 max-w-2xl text-base/7 text-pretty text-zinc-600 sm:text-lg/8 dark:text-zinc-300">
          Minlucks, cheese, and drops for {formatNumber(mouseCount)} mice and {formatNumber(itemCount)} items, plus the
          community&rsquo;s best guides and tools.
        </p>

        <div className="mt-5">
          <div className="max-w-2xl">
            <SearchBar />
          </div>
          {/* Wider than the search bar, so the pill-shaped examples fit on one line on a desktop. */}
          <SearchExamples
            examples={searchExamples}
            label="Try a mouse for its minluck and best cheese:"
            className="mt-3 max-w-3xl"
          />
        </div>

        <p className="mt-4 text-sm text-pretty text-zinc-600 dark:text-zinc-400">
          New to MouseHunt? {/* Opens in a new tab, like the same guide's card under Community favorites. */}
          <a
            href={BEGINNER_GUIDE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium text-pink-700 underline-offset-2 hover:underline focus:outline-hidden focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-pink-500 dark:text-pink-300"
          >
            Start with the Essentials guide
            <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>

        <nav aria-labelledby="lookups-heading" className="mt-7">
          <h2 id="lookups-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Handy tools
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-3">
            {quickLookups.map(({ href, name, description, image, tint }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 shadow-xs ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-pink-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:gap-3 sm:px-3.5 sm:py-3 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-pink-900"
                >
                  <span
                    className={clsx(
                      'flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
                      TINTS[tint],
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      decoding="async"
                      // Soft corners on every picture here, the Relic Hunter's too, so the cards match.
                      className="size-8 shrink-0 rounded-md object-contain"
                    />
                  </span>
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

      {/* The sidebar carries these from lg up, so only smaller screens get them here. */}
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
                        'group flex h-full items-center gap-3 rounded-2xl shadow-xs ring-1 ring-zinc-200 bg-white px-3.5 py-3 transition-colors focus:outline-hidden focus-visible:ring-2 dark:ring-zinc-800 dark:bg-zinc-900',
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
          <details className="group rounded-2xl shadow-xs ring-1 ring-zinc-200 bg-white dark:ring-zinc-800 dark:bg-zinc-900">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3.5 py-3 hover:bg-pink-50/50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 dark:hover:bg-pink-950/20 [&::-webkit-details-marker]:hidden">
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
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl shadow-xs ring-1 ring-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 transition-colors hover:ring-pink-300 hover:bg-pink-50/50 hover:text-pink-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 sm:min-h-9 dark:ring-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:ring-pink-800 dark:hover:bg-pink-950/20 dark:hover:text-pink-300"
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

      {popular.length > 0 && (
        <section aria-labelledby="favorites-heading" className="mt-12">
          <h2 id="favorites-heading" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Community favorites
          </h2>
          <ItemList items={popular} headingLevel={3} compact />
        </section>
      )}
    </div>
  );
}
