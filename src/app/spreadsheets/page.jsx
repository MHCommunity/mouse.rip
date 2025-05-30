import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { TableCellsIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Spreadsheets',
};

export default async function Spreadsheets() {
  const items = await getItemsByCategory('spreadsheet');

  return (
    <>
      <Heading>
        <TableCellsIcon className="w-12 h-12 mr-2 text-blue-800 align-middle inline-grid dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-300 shrink-0" />
        MouseHunt Spreadsheets
      </Heading>
      <ItemList items={items} />
    </>
  );
}
