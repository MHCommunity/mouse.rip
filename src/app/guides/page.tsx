import { AcademicCapIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/20/solid';
import { Link } from 'next-view-transitions';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { SectionHeading } from '@/components/section-heading';

import React from 'react';

import { getResourcesByCategory } from '@/lib/site-data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Guides',
  description: 'MouseHunt strategy and how-to guides, from your first hunt to endgame optimization.',
  path: '/guides',
});

/** mouse.rip's own reference pages: game facts rather than strategy, kept here instead of in the sidebar. */
const reference = [
  {
    href: '/titles',
    name: 'Titles and ranks',
    description: 'Every hunter rank from Novice to Fabled, and what each one needs',
    icon: TrophyIcon,
  },
  {
    href: '/trap-special-effects',
    name: 'Trap and base special effects',
    description: 'Traps and bases that behave differently in specific locations',
    icon: SparklesIcon,
  },
];

export default async function Guides() {
  const items = await getResourcesByCategory('guide');

  return (
    <>
      <PageHeader
        title="MouseHunt guides"
        description="Strategy and how-tos, from your first hunt to endgame optimization."
        count={items.length}
        countLabel="guides"
        icon={AcademicCapIcon}
        iconClassName="bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
      />
      <section aria-labelledby="reference-heading" className="mt-10">
        <SectionHeading>
          <span id="reference-heading">Game reference</span>
        </SectionHeading>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {reference.map(({ href, name, description, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3.5 py-3 transition-colors hover:border-pink-300 hover:bg-pink-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800 dark:hover:bg-pink-950/20"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-zinc-900 group-hover:text-pink-700 dark:text-zinc-100 dark:group-hover:text-pink-300">
                    {name}
                  </span>
                  <span className="mt-0.5 block text-xs/5 text-zinc-600 dark:text-zinc-400">{description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="guides-heading" className="mt-10">
        <SectionHeading>
          <span id="guides-heading">Guides</span>
        </SectionHeading>
        <ItemList items={items} showCategory={false} />
      </section>
    </>
  );
}
