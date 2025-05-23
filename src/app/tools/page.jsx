import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { WrenchIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Tools | mouse.rip',
};

export default async function Tools() {
  const items = getItemsByCategory('tool');

  return (
    <>
      <Heading>
        <WrenchIcon className="inline-grid w-12 h-12 mr-2 align-middle text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-300 shrink-0" />
        MouseHunt Tools
      </Heading>
      <ItemList items={items} />
    </>
  );
}
