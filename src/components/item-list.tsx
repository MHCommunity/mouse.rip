import clsx from 'clsx';

import { Item } from '@/components/item';
import { Resource } from '@/types';

type ItemListProps = {
  items: Array<Resource>;
  showtags?: boolean;
  /** Heading level for each card title; pass 3 when the list sits under a section h2. */
  headingLevel?: 2 | 3;
  /** Hide the per-card category badge on pages that list a single category. */
  showCategory?: boolean;
  /** Smaller cards for a short list that sits below a page's main tools (the home page). */
  compact?: boolean;
};

/** In a compact list, the last card spans the gap a short final row would leave. */
function lastCardSpan(count: number): string {
  return [count % 2 === 1 ? 'sm:col-span-2' : '', count % 3 === 2 ? 'lg:col-span-2' : 'lg:col-span-1'].join(' ');
}

export function ItemList({
  items,
  showtags = false,
  headingLevel = 2,
  showCategory = true,
  compact = false,
  ...props
}: ItemListProps) {
  if (!items.length) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
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

  if (compact) {
    return (
      <div className="relative mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.id} className={clsx('flex', index === items.length - 1 && lastCardSpan(items.length))}>
            <Item item={item} headingLevel={headingLevel} showCategory={showCategory} compact />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" {...props}>
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          showtags={showtags}
          headingLevel={headingLevel}
          showCategory={showCategory}
          {...props}
        />
      ))}
    </div>
  );
}
