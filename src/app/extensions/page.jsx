import { BoltIcon } from '@heroicons/react/20/solid';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

import { getItemsByCategory } from '@/data';

export const metadata = {
  title: 'MouseHunt Browser Extensions',
};

export default async function Extensions() {
  const items = await getItemsByCategory('extension');

  return (
    <>
      <Heading>
        <BoltIcon className="mr-2 inline-grid size-12 shrink-0 align-middle text-cyan-800 hover:text-cyan-900 dark:text-cyan-200 dark:hover:text-cyan-300" />
        MouseHunt Browser Extensions
      </Heading>
      <ItemList items={items} />
    </>
  );
}
