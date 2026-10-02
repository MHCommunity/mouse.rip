import { getItemsByCategory } from '@/data';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { WrenchIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Tools',
  description:
    'Calculators, simulators, and lookups for MouseHunt — plan your setups, crunch the numbers, and get more out of every hunt.',
  path: '/tools',
});

export default async function Tools() {
  const items = getItemsByCategory('tool');

  return (
    <>
      <PageHeader
        title="MouseHunt tools"
        description="Calculators, simulators, and lookups to plan setups and get more out of every hunt."
        count={items.length}
        countLabel="tools"
        icon={WrenchIcon}
        iconClassName="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      />
      <ItemList items={items} />
    </>
  );
}
