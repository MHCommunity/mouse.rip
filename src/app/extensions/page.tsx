import { ArrowUpRightIcon, BoltIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';
import { getResourcesByCategory } from '@/lib/site-data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Browser Extensions',
  description: 'Browser extensions that add in-game improvements to MouseHunt and log your hunts for community tools.',
  path: '/extensions',
});

const button =
  'inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900';

function OutLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <ArrowUpRightIcon className="size-4" aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default async function Extensions() {
  const items = getResourcesByCategory('extension');

  return (
    <>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Extensions' }]} />
      <PageHeader
        title="MouseHunt browser extensions"
        description="Browser add-ons for in-game improvements and hunt logging."
        count={items.length}
        countLabel="extensions"
        icon={BoltIcon}
        iconClassName="bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
      />
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
          >
            <h2 className="text-base font-semibold text-zinc-950 dark:text-white">{item.name}</h2>
            <p className="mt-1 max-w-prose text-sm/6 text-zinc-600 dark:text-zinc-400">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.install?.map(({ browser, url }) => (
                <OutLink
                  key={browser}
                  href={url}
                  className={clsx(button, 'bg-pink-600 text-white shadow-sm hover:bg-pink-700')}
                >
                  Add to {browser}
                </OutLink>
              ))}
              <OutLink
                href={item.url}
                className={clsx(
                  button,
                  'bg-white text-zinc-700 ring-1 ring-zinc-300 hover:text-pink-700 hover:ring-pink-300 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:text-pink-300 dark:hover:ring-pink-800',
                )}
              >
                {item.install?.length ? `Source on ${item.source ?? 'GitHub'}` : `Get it on ${item.source ?? 'GitHub'}`}
              </OutLink>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
