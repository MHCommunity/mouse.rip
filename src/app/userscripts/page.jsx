import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

export const metadata = {
  title: 'MouseHunt User Scripts | mouse.rip',
};

export default async function Userscripts() {
  const items = getItemsByCategory('userscript');

  return (
    <>
      <Heading>MouseHunt User Scripts</Heading>
      <ItemList items={items} />
    </>
  );
}
