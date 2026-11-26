import clsx from 'clsx';
import React from 'react';

import { Link } from '@/components/link';
import { userscriptTagCounts, userscriptTagName } from '@/lib/userscript-tags';

const chip =
  'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium ring-1 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500';

/** The userscript tags as filter chips; each leads to that tag's page, and "All" back to the list. */
export function UserscriptTagBar({ scripts, current }: { scripts: { tags?: string[] }[]; current?: string }) {
  const tags = userscriptTagCounts(scripts);
  const chipClass = (active: boolean) =>
    clsx(
      chip,
      active
        ? 'bg-pink-600 text-white ring-pink-600'
        : 'bg-white text-zinc-700 ring-zinc-200 hover:ring-pink-300 hover:text-pink-700 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:ring-pink-800 dark:hover:text-pink-300',
    );
  return (
    <nav aria-label="Userscripts by tag" className="mb-6">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link href="/userscripts" className={chipClass(!current)} aria-current={!current ? 'page' : undefined}>
            All
          </Link>
        </li>
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/userscripts/tags/${encodeURIComponent(tag)}`}
              className={chipClass(tag === current)}
              aria-current={tag === current ? 'page' : undefined}
            >
              {userscriptTagName(tag)}
              <span
                className={clsx(
                  'text-xs tabular-nums',
                  tag === current ? 'text-pink-100' : 'text-zinc-500 dark:text-zinc-400',
                )}
              >
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
