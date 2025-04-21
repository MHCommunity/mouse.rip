import { Heading } from '@/components/heading';
import { getItemsByCategory } from '@/data';
import { Item } from '@/components/item';

export const metadata = {
  title: 'Tools',
};

export default async function Tools() {
  const items = getItemsByCategory('tool');

  return (
    <>
      <Heading>MouseHunt Tools</Heading>
      <div className="relative grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        { items.map((item) => (
          <Item key={ item.id } item={ item } />
        )) }
	</div>
	</>
  );
}
