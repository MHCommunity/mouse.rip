import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { BoltIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Browser Extensions',
};

export default async function Extensions() {
  const items = await getItemsByCategory('extension');

  return (
    <>
      <Heading>
        <BoltIcon className="inline-grid w-12 h-12 mr-2 align-middle text-cyan-800 dark:text-cyan-200 hover:text-cyan-900 dark:hover:text-cyan-300 shrink-0" />
        MouseHunt Browser Extensions
      </Heading>
      <ItemList items={items} />
    </>
  );
}
