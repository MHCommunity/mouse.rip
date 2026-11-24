import { getResourcesByCategory } from '@/lib/site-data';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { WrenchIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Tools',
  description:
    'Calculators, simulators, and lookups for MouseHunt, from catch rates and minlucks to Marketplace prices.',
  path: '/tools',
});

export default async function Tools() {
  const items = getResourcesByCategory('tool');

  return (
    <>
      <PageHeader
        title="MouseHunt tools"
        description="Calculators, simulators, and lookups, from catch rates and minlucks to Marketplace prices."
        count={items.length}
        countLabel="tools"
        icon={WrenchIcon}
        iconClassName="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      />
      <ItemList items={items} />
    </>
  );
}
