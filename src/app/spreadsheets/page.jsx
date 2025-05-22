import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

export const metadata = {
  title: 'MouseHunt Spreadsheets | mouse.rip',
};

export default async function Spreadsheets() {
  const items = await getItemsByCategory('spreadsheet');

  return (
    <>
      <Heading>MouseHunt Spreadsheets</Heading>
      <ItemList items={items} />
    </>
  );
}
