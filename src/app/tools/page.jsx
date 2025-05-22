import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

export const metadata = {
  title: 'MouseHunt Tools | mouse.rip',
};

export default async function Tools() {
  const items = getItemsByCategory('tool');

  return (
    <>
      <Heading>MouseHunt Tools</Heading>
      <ItemList items={items} />
    </>
  );
}
