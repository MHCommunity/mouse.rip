import { Heading } from '@/components/heading';
import { getItemsByLocation } from '@/data';
import { Item } from '@/components/item';
import Link from 'next/link';

export const metadata = {
  title: 'MouseHunt Items',
};

export default async function Locations() {
  const items = await fetch('https://api.mouse.rip/items').then((res) => res.json());

  return (
    <>
      <Heading></Heading>
      <ul className="list-disc list-inside mb-4">
        { items.map((item) => (
          <li key={ item.id } className="text-sm text-sky-500 dark:text-sky-200 hover:text-sky-700 dark:hover:text-sky-300">
            <Link href={ `/item/${item.type}` }>
              { item.name }
	</Link>
	</li>
        )) }
	</ul>
	</>
  );
}
