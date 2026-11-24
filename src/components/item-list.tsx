import clsx from 'clsx';

import { Item } from '@/components/item';
import { Resource } from '@/types';

type ItemListProps = {
  items: Array<Resource>;
  showtags?: boolean;
  /** Heading level for each row's title; pass 3 when the list sits under a section h2. */
  headingLevel?: 2 | 3;
  /** Hide the per-row category badge on pages that list a single category. */
  showCategory?: boolean;
  /** Less space above, for a short list beneath a page's main tools (the home page). */
  compact?: boolean;
};

/**
 * Resources as one list of rows. They're links to read and pick from, so they
 * stack like the data tables elsewhere on the site rather than sitting in cards.
 */
export function ItemList({
  items,
  showtags = false,
  headingLevel = 2,
  showCategory = true,
  compact = false,
}: ItemListProps) {
  if (!items.length) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Nothing here yet. Suggest something on{' '}
        <a
          href="https://discord.gg/mousehunt"
          className="font-medium text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200"
        >
          Discord
        </a>
        .
      </div>
    );
  }

  return (
    <ul
      className={clsx(
        compact ? 'mt-4' : 'mt-6',
        'divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900',
      )}
    >
      {items.map((item) => (
        <li key={item.id}>
          <Item item={item} showtags={showtags} headingLevel={headingLevel} showCategory={showCategory} />
        </li>
      ))}
    </ul>
  );
}
