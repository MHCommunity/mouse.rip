import { Heading } from '@/components/heading';
import { getItemsByLocation, getLocations } from '@/data';
import { Item } from '@/components/item';

export const metadata = {
  title: 'Locations',
};

export default async function Locations() {
  const items = await getItemsByLocation('all');

  return (
    <>
      <Heading></Heading>
      <div className="relative grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        { items.map((item) => (
          <Item key={ item.id } item={ item } />
        )) }
	</div>
	</>
  );
}
