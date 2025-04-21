import { Heading } from '@/components/heading';
import { getItems } from '@/data';
import { Item } from '@/components/item';
import { Input, InputGroup } from '@/components/input';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default async function Home() {
  const items = getItems();

  return (
    <>
      <Heading className="mb-5">
		MouseHunt Guides, Extensions, Spreadsheets, Tools, and Userscripts
      </Heading>
      <InputGroup>
        <MagnifyingGlassIcon />
        <Input placeholder="Search for mice, items, locations, or more." className="flex rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600" />
	</InputGroup>
      <div className="relative grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
        { items.map((item) => (
          <Item key={ item.id } item={ item } />
        )) }
	</div>
	</>
  );
}
