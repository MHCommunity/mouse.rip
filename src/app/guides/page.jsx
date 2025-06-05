import { AcademicCapIcon } from '@heroicons/react/20/solid';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

import { getItemsByCategory } from '@/data';

export const metadata = {
  title: 'MouseHunt Guides',
};

export default async function Guides() {
  const items = await getItemsByCategory('guide');

  return (
    <>
      <Heading>
        <AcademicCapIcon className="mr-2 inline-grid size-12 shrink-0 align-middle text-pink-800 hover:text-pink-900 dark:text-pink-200 dark:hover:text-pink-300" />
        MouseHunt Guides
      </Heading>
      <ItemList items={items} />
    </>
  );
}
