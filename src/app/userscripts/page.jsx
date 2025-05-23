import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { SwatchIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Usercripts | mouse.rip',
};

export default async function Userscripts() {
  const items = getItemsByCategory('userscript');

  return (
    <>
      <Heading>
        <SwatchIcon className="inline-grid w-12 h-12 mr-2 align-middle text-purple-800 dark:text-purple-200 hover:text-purple-900 dark:hover:text-purple-300 shrink-0" />
        MouseHunt Userscripts
      </Heading>
      <ItemList items={items} showtags="true" />
    </>
  );
}
