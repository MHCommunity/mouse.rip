import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

export const metadata = {
  title: 'MouseHunt Guides | mouse.rip',
};

export default async function Guides() {
  const items = await getItemsByCategory('guide');

  return (
    <>
      <Heading>MouseHunt Guides</Heading>
      <ItemList items={items} />
    </>
  );
}
