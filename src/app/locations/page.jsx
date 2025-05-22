import { getItemsByLocation } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

export const metadata = {
  title: 'Locations',
};

export default async function Locations() {
  const items = await getItemsByLocation('all');

  return (
    <>
      <Heading>MouseHunt Locations</Heading>
      <ItemList items={items} />
    </>
  );
}
