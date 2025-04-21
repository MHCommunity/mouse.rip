import { getItemsByCategory } from '@/data';
import { Heading } from '@/components/heading';
import { Item } from '@/components/item';

export const metadata = {
  title: 'Extensions',
};

export default async function Extensions() {
  const items = await getItemsByCategory('extension');

  return (
    <>
      <Heading>MouseHunt Browser Extensions</Heading>
      <div className="relative grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        {items.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
