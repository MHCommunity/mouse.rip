import { BoltIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';

import React from 'react';

import { getItemsByCategory } from '@/data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Browser Extensions',
  description: 'Browser extensions that improve MouseHunt — quality-of-life upgrades, helper tools, and data tracking for catch-rate calculators.',
  path: '/extensions',
});

export default async function Extensions() {
  const items = getItemsByCategory('extension');

  return (
    <>
      <PageHeader
        title="MouseHunt browser extensions"
        description="Browser add-ons that layer quality-of-life features directly onto MouseHunt."
        count={items.length}
        countLabel="extensions"
        icon={BoltIcon}
        iconClassName="bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
      />
      <ItemList items={items} />
    </>
  );
}
