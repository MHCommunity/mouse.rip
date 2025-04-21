import { Heading } from '@/components/heading';
import { getItemsByLocation, getLocation } from '@/data';
import { notFound } from 'next/navigation';
import { Item } from '@/components/item';

export async function generateMetadata({ params }) {
  const location = await getLocation(params.id);

  return {
    title: location.name,
  };
}

export default async function Location({ params }) {
  const location = await getLocation(params.id);
  const items = await getItemsByLocation(params.id);

  if (! location || ! items) {
    notFound();
  }

  return (
    <>
      <Heading>{ location.name }</Heading>
      <div className="relative grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        { items.map((item) => (
          <Item key={ item.id } item={ item } />
        )) }
	</div>
	</>
  );
}
