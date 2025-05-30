import Link from 'next/link';
import { Heading } from '@/components/heading';
import { Divider } from '@/components/divider';
import { ItemList } from '@/components/item-list';
import { getPopularItems } from '@/data';
import { AcademicCapIcon, BoltIcon, TableCellsIcon, WrenchIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'MouseHunt Guides, Extensions, Tools, and Resources',
  description: 'Your comprehensive resource for MouseHunt guides, browser extensions, tools, spreadsheets, and userscripts to enhance your MouseHunt experience.',
};

export default function Home() {
  const items = getPopularItems();

  return (
    <div className="max-w-5xl px-6 py-10 mx-auto">
      <Heading className="mb-6 text-center">
        🐭️ Become the best MouseHunter you can be! 🐭️
      </Heading>

      <p className="max-w-2xl mx-auto mb-8 text-lg text-center text-gray-700 dark:text-gray-300">
        Explore a curated collection of guides, extensions, tools, spreadsheets, and userscripts to help you hunt smarter, faster, and more efficiently.
      </p>

      <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/guides"
          className="block p-5 text-pink-700 bg-white border border-pink-300 rounded-lg dark:text-pink-400 transition hover:shadow-md hover:-translate-y-1 dark:bg-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          aria-label="Browse MouseHunt Guides"
        >
          <span className="block mb-1 text-lg font-semibold">
            <AcademicCapIcon
              className="inline w-6 h-6 mr-2 text-pink-800 align-middle dark:text-pink-200 hover:text-pink-900 dark:hover:text-pink-300 shrink-0"
              aria-hidden="true"
            />
            MouseHunt Guides
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Learn strategies and tips from experienced hunters</span>
        </Link>
        <Link
          href="/extensions"
          className="block p-5 bg-white border rounded-lg border-cyan-300 text-cyan-700 dark:text-cyan-400 transition hover:shadow-md hover:-translate-y-1 dark:bg-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          aria-label="Browse Browser Extensions"
        >
          <span className="block mb-1 text-lg font-semibold">
            <BoltIcon
              className="inline w-6 h-6 mr-2 align-middle text-cyan-800 dark:text-cyan-200 hover:text-cyan-900 dark:hover:text-cyan-300 shrink-0"
              aria-hidden="true"
            />
            Browser Extensions
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Enhance your browser with powerful MouseHunt tools</span>
        </Link>
        <Link
          href="/tools"
          className="block p-5 text-green-700 bg-white border border-green-300 rounded-lg dark:text-green-400 transition hover:shadow-md hover:-translate-y-1 dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
          aria-label="Browse Tools & Helpers"
        >
          <span className="block mb-1 text-lg font-semibold">
            <WrenchIcon
              className="inline w-6 h-6 mr-2 text-green-800 align-middle dark:text-green-200 hover:text-green-900 dark:hover:text-green-300 shrink-0"
              aria-hidden="true"
            />
            Tools & Helpers
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Utilities to optimize your hunting strategy</span>
        </Link>
        <Link
          href="/spreadsheets"
          className="block p-5 text-blue-700 bg-white border border-blue-300 rounded-lg dark:text-blue-400 transition hover:shadow-md hover:-translate-y-1 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Browse Spreadsheets"
        >
          <span className="block mb-1 text-lg font-semibold">
            <TableCellsIcon
              className="inline w-6 h-6 mr-2 text-blue-800 align-middle dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-300 shrink-0"
              aria-hidden="true"
            />
            Spreadsheets
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Data-driven tools for advanced hunters</span>
        </Link>
      </div>

      <Divider className="my-16" />

      <section aria-labelledby="popular-items-heading" className="mt-16">
        <h2 id="popular-items-heading" className="mb-2 text-2xl font-bold text-center text-gray-900 dark:text-white">
          Community Favorites
        </h2>
        <p className="max-w-2xl mx-auto mb-8 text-lg text-center text-gray-700 dark:text-gray-300">
          Some of the most popular items in the community:
        </p>
        <ItemList items={items} />
      </section>
    </div>
  );
}
