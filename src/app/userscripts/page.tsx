import { getResourcesByCategory } from '@/lib/site-data';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';
import { ItemList } from '@/components/item-list';
import { SwatchIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Userscripts',
  description:
    'Hand-picked MouseHunt userscripts that add features to the game, from Marketplace price charts to event puzzle helpers and map tools.',
  path: '/userscripts',
});

export default async function Userscripts() {
  const items = getResourcesByCategory('userscript');

  return (
    <>
      <PageHeader
        title="MouseHunt userscripts"
        description={
          <>
            Scripts you install in your browser to add features to MouseHunt.{' '}
            <PageLink href="https://github.com/MHCommunity/mousehunt-improved">MouseHunt Improved</PageLink> includes
            most of these features in one extension.
          </>
        }
        count={items.length}
        countLabel="userscripts"
        icon={SwatchIcon}
        iconClassName="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
      />
      <ItemList items={items} showCategory={false} showtags />
    </>
  );
}
