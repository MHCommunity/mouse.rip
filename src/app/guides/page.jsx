import { Heading } from '@/components/heading';
import { getItems, getItemsByCategory } from '@/data';
import { Item } from '@/components/item';

export const metadata = {
  title: 'Guides',
};

export default async function Guides() {
  const items = await getItemsByCategory('guide');

  return (
    <>
      <Heading>MouseHunt Guides</Heading>
      <div className="relative grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        { items.map((item) => (
          <Item key={ item.id } item={ item } />
        )) }
	</div>
	</>
  );
}
