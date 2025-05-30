import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { AcademicCapIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Guides',
};

export default async function Guides() {
  const items = await getItemsByCategory('guide');

  return (
    <>
      <Heading>
        <AcademicCapIcon className="w-12 h-12 mr-2 text-pink-800 align-middle inline-grid dark:text-pink-200 hover:text-pink-900 dark:hover:text-pink-300 shrink-0" />
        MouseHunt Guides
      </Heading>
      <ItemList items={items} />
    </>
  );
}
