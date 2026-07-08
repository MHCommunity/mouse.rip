import { getItemsByCategory } from '@/data';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { TableCellsIcon } from '@heroicons/react/20/solid';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'MouseHunt Spreadsheets',
  description: 'Community-maintained MouseHunt spreadsheets for tracking collections, crowns, minlucks, wisdom, and planning your progression.',
  path: '/spreadsheets',
});

export default async function Spreadsheets() {
  const items = await getItemsByCategory('spreadsheet');

  return (
    <>
      <PageHeader
        title="MouseHunt spreadsheets"
        description="Community-maintained sheets for tracking collections, planning, and crunching the numbers."
        count={items.length}
        countLabel="spreadsheets"
        icon={TableCellsIcon}
        iconClassName="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      />
      <ItemList items={items} />
    </>
  );
}
