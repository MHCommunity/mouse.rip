import { notFound } from 'next/navigation';

import { getItemsByLocation, getLocation, getLocations } from '@/data';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

let location;

export async function generateMetadata({ params }) {
  location = location || await getLocation(params.id);

  return {
    title: `MouseHunt Guides, Extensions, Spreadsheets, Tools, and User scripts for ${location.name} | mouse.rip`,
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
  location = location || await getLocation(params.id);
  const items = await getItemsByLocation(params.id);

  if (! location || ! items) {
    notFound();
  }

  return (
    <>
      <Heading>MouseHunt Guides, Extensions, Spreadsheets, Tools, and User scripts for {location.name}</Heading>
      <ItemList items={items} />
    </>
  );
}
