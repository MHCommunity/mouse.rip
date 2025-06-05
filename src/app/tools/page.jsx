import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { WrenchIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Tools',
};

export default async function Tools() {
  const items = getItemsByCategory('tool');

  return (
    <>
      <Heading>
        <WrenchIcon className="mr-2 inline-grid size-12 shrink-0 align-middle text-green-800 hover:text-green-900 dark:text-green-200 dark:hover:text-green-300" />
        MouseHunt Tools
      </Heading>
      <ItemList items={items} />
    </>
  );
}
