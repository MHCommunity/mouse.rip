import { Link } from 'next-view-transitions';

import React from 'react';

import {
  AcademicCapIcon,
  ArrowRightIcon,
  BoltIcon,
  SwatchIcon,
  TableCellsIcon,
  WrenchIcon,
} from '@heroicons/react/20/solid';
import { Subheading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { SearchBar } from '@/components/search/search-button';

import { getItemsByCategory, getPopularItems } from '@/data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Guides, Extensions, Tools, and Resources',
  description:
    'A community-built collection of MouseHunt guides, extensions, tools, spreadsheets, and userscripts. Everything you need to hunt smarter, in one place.',
  path: '/',
});

type Category = {
  href: string;
  name: string;
  description: string;
  countLabel: string;
  icon: typeof AcademicCapIcon;
  category: string;
  featured?: boolean;
  /** lg-breakpoint column span inside the bento grid. */
  span: string;
  /** Icon chip background + foreground. */
  chip: string;
  /** Border that warms to the accent on hover. */
  hoverBorder: string;
  ring: string;
};

const categories: Array<Category> = [
  {
    href: '/guides',
    name: 'Guides',
    description:
      'From your very first hunt to endgame optimization — written and battle-tested by experienced hunters.',
    countLabel: 'guides',
    icon: AcademicCapIcon,
    category: 'guide',
    featured: true,
    span: 'lg:col-span-3',
    chip: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
    hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-800',
    ring: 'focus-visible:ring-pink-500',
  },
  {
    href: '/extensions',
    name: 'Extensions',
    description:
      'Browser add-ons that layer powerful quality-of-life features right onto the MouseHunt interface.',
    countLabel: 'extensions',
    icon: BoltIcon,
    category: 'extension',
    featured: true,
    span: 'lg:col-span-3',
    chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-800',
    ring: 'focus-visible:ring-cyan-500',
  },
  {
    href: '/tools',
    name: 'Tools',
    description: 'Calculators, simulators, and lookups for planning your next hunt.',
    countLabel: 'tools',
    icon: WrenchIcon,
    category: 'tool',
    span: 'lg:col-span-2',
    chip: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    hoverBorder: 'hover:border-green-300 dark:hover:border-green-800',
    ring: 'focus-visible:ring-green-500',
  },
  {
    href: '/spreadsheets',
    name: 'Spreadsheets',
    description: 'Community-maintained sheets for tracking progress and crunching numbers.',
    countLabel: 'spreadsheets',
    icon: TableCellsIcon,
    category: 'spreadsheet',
    span: 'lg:col-span-2',
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-800',
    ring: 'focus-visible:ring-blue-500',
  },
  {
    href: '/userscripts',
    name: 'Userscripts',
    description: 'Lightweight scripts that customize and extend the game interface.',
    countLabel: 'userscripts',
    icon: SwatchIcon,
    category: 'userscript',
    span: 'lg:col-span-2',
    chip: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-800',
    ring: 'focus-visible:ring-purple-500',
  },
];

const easing = 'ease-[cubic-bezier(0.32,0.72,0,1)]';

export default function Home() {
  const popular = getPopularItems();

  return (
    <div className="mx-auto max-w-5xl">
      {/* ---------- Hero ---------- */}
      <section className="relative isolate pt-2 pb-10">
        {/* Soft mesh-glow backdrop — decorative, never interactive. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[460px] w-[820px] max-w-[140%] -translate-x-1/2 opacity-70 blur-[90px] dark:opacity-50"
        >
          <div className="absolute left-0 top-10 h-64 w-64 rounded-full bg-pink-300/50 dark:bg-pink-600/25" />
          <div className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-cyan-300/40 dark:bg-cyan-500/20" />
          <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-purple-300/40 dark:bg-purple-600/20" />
        </div>

        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white">
            MouseHunt guides, tools, and resources
          </h1>

          <p className="mt-5 text-lg/8 text-pretty text-zinc-600 dark:text-zinc-300">
            A community-built collection of guides, extensions, tools, spreadsheets, and
            userscripts. Everything you need to hunt smarter, in one place.
          </p>

          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ---------- Category bento ---------- */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-6">
        {categories.map(({ href, name, description, countLabel, icon: Icon, category, featured, span, chip, hoverBorder, ring }) => {
          const count = getItemsByCategory(category).length;

          return (
            <Link
              key={href}
              href={href}
              aria-label={`Browse ${name}`}
              className={`group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-300 ${easing} hover:-translate-y-1 hover:shadow-md active:translate-y-0 motion-reduce:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfcfb] md:col-span-2 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-visible:ring-offset-[#0a0a0a] ${span} ${hoverBorder} ${ring}`}
            >
              <span
                className={`flex items-center justify-center rounded-2xl transition-transform duration-300 ${easing} group-hover:scale-105 motion-reduce:transform-none ${chip} ${featured ? 'size-14' : 'size-12'}`}
              >
                <Icon className={featured ? 'size-7' : 'size-6'} aria-hidden="true" />
              </span>

              <h2
                className={`mt-5 font-semibold tracking-tight text-zinc-900 dark:text-white ${featured ? 'text-2xl' : 'text-lg'}`}
              >
                {name}
              </h2>
              <p
                className={`mt-1.5 text-pretty text-zinc-600 dark:text-zinc-400 ${featured ? 'text-base/7 max-w-md' : 'text-sm/6'}`}
              >
                {description}
              </p>

              <span className="mt-auto flex items-center justify-between pt-6">
                <span className="text-xs font-medium tabular-nums text-zinc-400 dark:text-zinc-500">
                  {count} {countLabel}
                </span>
                {/* Button-in-button trailing arrow. */}
                <span
                  className={`flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-all duration-300 ${easing} group-hover:translate-x-0.5 group-hover:bg-zinc-900 group-hover:text-white motion-reduce:transform-none dark:bg-white/10 dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-900`}
                >
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* ---------- Community favorites ---------- */}
      <section className="mt-24 pb-8">
        <Subheading level={2} className="text-2xl tracking-tight">
          Community favorites
        </Subheading>
        <p className="mt-1.5 text-base/7 text-zinc-600 dark:text-zinc-400">
          A few of the resources hunters reach for most often.
        </p>
        <ItemList items={popular} />
      </section>
    </div>
  );
}
