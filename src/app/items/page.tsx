import React from 'react';

import { CheeseIcon } from '@/components/game-icons';
import { PageHeader } from '@/components/page-header';

import { getAllGameItems, itemSlug } from '@/lib/game-data';
import { pageMetadata } from '@/seo';
import { ItemsBrowser, type SlimItem } from './items-browser';

export const metadata = pageMetadata({
  title: 'MouseHunt Items',
  description:
    'Every item in MouseHunt — weapons, bases, charms, cheese, collectibles, and more. Filter by type or name for stats, descriptions, and drop info.',
  path: '/items',
});

// Friendlier classifications first; the rest follow alphabetically.
const CLASSIFICATION_ORDER = [
  'weapon',
  'base',
  'bait',
  'trinket',
  'potion',
  'crafting_item',
  'convertible',
  'collectible',
  'map_piece',
  'skin',
];

export default function ItemsIndexPage() {
  const items = getAllGameItems();

  const slim: SlimItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    slug: itemSlug(item.type),
    classification: item.classification || 'other',
    tradable: item.is_tradable || undefined,
  }));

  const present = new Set(slim.map((item) => item.classification));
  const classificationOrder = [
    ...CLASSIFICATION_ORDER.filter((key) => present.has(key)),
    ...[...present].filter((key) => !CLASSIFICATION_ORDER.includes(key)).sort(),
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Items"
        description="Browse every item in MouseHunt. Filter by type or name — each item has its own page with its description, stats, and where it drops."
        count={items.length}
        countLabel="items"
        icon={CheeseIcon}
        iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      />

      <ItemsBrowser items={slim} classificationOrder={classificationOrder} />
    </div>
  );
}
