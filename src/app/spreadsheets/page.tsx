import { getResourcesByCategory } from '@/lib/site-data';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { TableCellsIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Spreadsheets',
  description:
    'Community-maintained MouseHunt spreadsheets for minlucks, wisdom, crowns, item data, and location trap effects.',
  path: '/spreadsheets',
});

export default async function Spreadsheets() {
  const items = await getResourcesByCategory('spreadsheet');

  return (
    <>
      <PageHeader
        title="MouseHunt spreadsheets"
        description="Community-maintained sheets for minlucks, wisdom, crowns, and item data."
        count={items.length}
        countLabel="spreadsheets"
        icon={TableCellsIcon}
        iconClassName="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      />
      <ItemList items={items} showCategory={false} />
    </>
  );
}
