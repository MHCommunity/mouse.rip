import { BoltIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';

import React from 'react';

import { getResourcesByCategory } from '@/lib/site-data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Browser Extensions',
  description: 'Browser extensions that add in-game improvements to MouseHunt and log your hunts for community tools.',
  path: '/extensions',
});

export default async function Extensions() {
  const items = getResourcesByCategory('extension');

  return (
    <>
      <PageHeader
        title="MouseHunt browser extensions"
        description="Browser add-ons for in-game improvements and hunt logging."
        count={items.length}
        countLabel="extensions"
        icon={BoltIcon}
        iconClassName="bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
      />
      <ItemList items={items} showCategory={false} />
    </>
  );
}
