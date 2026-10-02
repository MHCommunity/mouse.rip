import { getItemsByCategory } from '@/data';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { SwatchIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Userscripts',
  description:
    'A curated collection of MouseHunt userscripts that add features, automate busywork, and surface useful in-game data.',
  path: '/userscripts',
});

export default async function Userscripts() {
  const items = getItemsByCategory('userscript');

  return (
    <>
      <PageHeader
        title="MouseHunt userscripts"
        description="Lightweight scripts that customize and extend the MouseHunt interface."
        count={items.length}
        countLabel="userscripts"
        icon={SwatchIcon}
        iconClassName="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
      />
      <ItemList items={items} showtags />
    </>
  );
}
