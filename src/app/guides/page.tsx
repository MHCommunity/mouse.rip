import { AcademicCapIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';

import React from 'react';

import { getItemsByCategory } from '@/data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Guides',
  description: 'MouseHunt strategy and how-to guides, from your first hunt to endgame optimization, written and curated by experienced hunters.',
  path: '/guides',
});

export default async function Guides() {
  const items = await getItemsByCategory('guide');

  return (
    <>
      <PageHeader
        title="MouseHunt guides"
        description="From your first hunt to endgame optimization, strategy and how-tos written by experienced hunters."
        count={items.length}
        countLabel="guides"
        icon={AcademicCapIcon}
        iconClassName="bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
      />
      <ItemList items={items} />
    </>
  );
}
