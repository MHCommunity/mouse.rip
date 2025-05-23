// import { Input, InputGroup } from '@/components/input';
import { getItemsWithoutUserscripts } from '@/data';
import { Heading } from '@/components/heading';
// import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { ItemList } from '@/components/item-list';

export const metadata = {
  title: 'MouseHunt Guides, Extensions, Spreadsheets, Tools, and User scripts | mouse.rip',
};

export default async function Home() {
  const items = getItemsWithoutUserscripts();

  return (
    <>
      <Heading className="mb-5">
        MouseHunt Guides, Extensions, Spreadsheets, Tools, and User scripts
      </Heading>
      {/* <InputGroup>
        <MagnifyingGlassIcon />
        <Input
          placeholder="Search for mice, items, locations, or more…"
          className="flex bg-white rounded-md outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-pink-400 dark:bg-gray-800 dark:outline-gray-600 dark:focus-within:outline-pink-400"

        />
      </InputGroup> */}
      <ItemList items={items} />
    </>
  );
}
