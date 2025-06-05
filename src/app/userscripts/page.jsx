import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { SwatchIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Usercripts',
};

export default async function Userscripts() {
  const items = getItemsByCategory('userscript');

  return (
    <>
      <Heading>
        <SwatchIcon className="mr-2 inline-grid size-12 shrink-0 align-middle text-purple-800 hover:text-purple-900 dark:text-purple-200 dark:hover:text-purple-300" />
        MouseHunt Userscripts
      </Heading>
      <ItemList items={items} showtags="true" />
    </>
  );
}
