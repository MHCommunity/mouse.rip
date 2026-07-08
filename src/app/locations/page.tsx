import { getItemsByLocation } from '@/data';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { MapIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Locations',
  description: 'Every MouseHunt hunting location, plus the guides, tools, and resources that apply to each one.',
  path: '/locations',
});

export default async function Locations() {
  const items = await getItemsByLocation('all');

  return (
    <>
      <PageHeader
        title="MouseHunt locations"
        description="Resources that apply everywhere, plus a jumping-off point for every hunting location. Pick a location from the sidebar to narrow things down."
        count={items.length}
        countLabel="resources"
        icon={MapIcon}
        iconClassName="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      />
      <ItemList items={items} />
    </>
  );
}
