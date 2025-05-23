import { notFound } from 'next/navigation';

import { getItemsByLocation, getLocation, getLocations } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';
import { Avatar } from '@/components/avatar';

let location;

export async function generateMetadata({ params }) {
  location = getLocation(params.id);

  return {
    title: `MouseHunt Resources for ${location.article ? location.article : location.name} | mouse.rip`,
  };
}

export function generateStaticParams() {
  const locations = getLocations();
  if (! locations) {
    return [];
  }

  const paths = locations.map((region) => {
    return region.locations.map((environment) => {
      return {
        id: environment.id,
      };
    });
  });

  return paths.flat();
}

export default async function Location({ params }) {
  location = getLocation(params.id);
  const items = await getItemsByLocation(params.id);

  if (! location || ! items) {
    notFound();
  }

  return (
    <>
      <Heading>
        <Avatar
          src={location.image}
          alt={location.name}
          width={32}
          height={32}
          square
          className="mr-2"
        />
        MouseHunt Resources for {location.article ? location.article : location.name}
      </Heading>
      <ItemList items={items} />
    </>
  );
}
