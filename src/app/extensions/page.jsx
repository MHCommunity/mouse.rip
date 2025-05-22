import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

export const metadata = {
  title: 'MouseHunt Browser Extensions | mouse.rip',
};

export default async function Extensions() {
  const items = await getItemsByCategory('extension');

  return (
    <>
      <Heading>MouseHunt Browser Extensions</Heading>
      <ItemList items={items} />
    </>
  );
}
