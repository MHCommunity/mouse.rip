import { notFound } from 'next/navigation';

import { Avatar } from '@/components/avatar';
import { Heading } from '@/components/heading';
import { ItemList } from '@/components/item-list';

import { getItemsByLocation, getLocation, getLocations } from '@/data';

let location;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  location = getLocation(resolvedParams.id);

  if (! location) {
    return { title: 'Not Found' };
  }

  return {
    title: `MouseHunt Resources for ${location.article ? location.article : location.name}`,
  };
}

export function generateStaticParams() {
  const locations = getLocations();
  if (! locations) {
    return [];
  }

  type Environment = { id: string };

  const paths = locations.map((region: { locations: Environment[] }) => {
    return region.locations.map((environment: Environment) => {
      return {
        id: environment.id,
      };
    });
  });

  return paths.flat();
}

export default async function Location({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  location = getLocation(resolvedParams.id);
  const items = await getItemsByLocation(resolvedParams.id);

  if (! location || ! items) {
    notFound();
  }

  return (
    <>
      <Heading>
        <Avatar
          src={`/images/locations/${location.id.replaceAll('_', '-')}.png`}
          alt={location.name}
          square
          className="mr-2"
        />
        MouseHunt Resources for {location.article ? location.article : location.name}
      </Heading>
      <ItemList items={items} />
    </>
  );
}
