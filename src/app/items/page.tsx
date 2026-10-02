import React, { Suspense } from 'react';

import { CheeseIcon } from '@/components/game-icons';
import { PageHeader } from '@/components/page-header';

import { getAllGameItems } from '@/lib/game-data';
import { orderClassifications } from '@/lib/item-classifications';
import { pageMetadata } from '@/seo';
import { ItemsBrowser } from './items-browser';

export const metadata = pageMetadata({
  title: 'MouseHunt Items',
  description:
    'Every item in MouseHunt — weapons, bases, charms, cheese, collectibles, and more. Filter by type or name for stats, descriptions, and drop info.',
  path: '/items',
});

export default function ItemsIndexPage() {
  const items = getAllGameItems();

  // Only the per-type totals cross to the client. The item list itself is a
  // code-split chunk the browser fetches on demand (see @/lib/client-index) —
  // inlining all 4,033 items here would put ~70 KB of duplicated JSON into this
  // page's HTML, and again into /marketplace's, and again into search's.
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = item.classification || 'other';
    counts[key] = (counts[key] ?? 0) + 1;
  }

  const classificationOrder = orderClassifications(Object.keys(counts));

  return (
    <div>
      <PageHeader
        title="Items"
        description="Every item in MouseHunt — weapons, bases, charms, cheese, chests, and collectibles. Pick a type or search by name; each item has its own page with its stats, where it drops, and what's inside it."
        count={items.length}
        countLabel="items"
        icon={CheeseIcon}
        iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      />

      {/* ItemsBrowser reads the filters off the URL with useSearchParams, which
          would opt this page into dynamic rendering without a boundary here. The
          page must stay static: game-data reads its JSON off disk at build time,
          and that disk isn't there in the Cloudflare worker. */}
      <Suspense>
        <ItemsBrowser counts={counts} classificationOrder={classificationOrder} />
      </Suspense>
    </div>
  );
}
