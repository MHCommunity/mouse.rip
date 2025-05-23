import Link from 'next/link';
import { Heading } from '@/components/heading';
import { Divider } from '@/components/divider';
import { ItemList } from '@/components/item-list';
import { getPopularItems } from '@/data';
import { AcademicCapIcon, BoltIcon, TableCellsIcon, WrenchIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Guides, Extensions, Tools, and Resources | mouse.rip',
};

export default function Home() {
  const items = getPopularItems();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Heading className="text-center mb-6">
        🐭️ Become the best MouseHunter you can be! 🐭️
      </Heading>

      <p className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
        Explore a curated collection of guides, extensions, tools, spreadsheets, and userscripts to help you hunt smarter, faster, and more efficiently.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Link href="/guides" className="block border border-pink-300 text-pink-700 dark:text-pink-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900">
          <span className="block font-semibold text-lg mb-1">
            <AcademicCapIcon className="inline w-6 h-6 mr-2 align-middle text-pink-800 dark:text-pink-200 hover:text-pink-900 dark:hover:text-pink-300 shrink-0" />
            MouseHunt Guides
          </span>
        </Link>
        <Link href="/extensions" className="block border border-cyan-300 text-cyan-700 dark:text-cyan-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900">
          <span className="block font-semibold text-lg mb-1">
            <BoltIcon className="inline w-6 h-6 mr-2 align-middle text-cyan-800 dark:text-cyan-200 hover:text-cyan-900 dark:hover:text-cyan-300 shrink-0" />
            Browser Extensions
          </span>
        </Link>
        <Link href="/tools" className="block border border-green-300 text-green-700 dark:text-green-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900">
          <span className="block font-semibold text-lg mb-1">
            <WrenchIcon className="inline w-6 h-6 mr-2 align-middle text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-300 shrink-0" />
            Tools & Helpers
          </span>
        </Link>
        <Link href="/spreadsheets" className="block border border-blue-300 text-blue-700 dark:text-blue-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900">
          <span className="block font-semibold text-lg mb-1">
            <TableCellsIcon className="inline w-6 h-6 mr-2 align-middle text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-300 shrink-0" />
            Spreadsheets
          </span>
        </Link>
      </div>

      <Divider className="my-16" />

      <div className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8 ">
        Some of the most popular items in the community:
      </div>
      <ItemList items={items} />
    </div>
  );
}
