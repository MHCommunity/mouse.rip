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
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Heading className="text-center mb-6">
        🐭️ Become the best MouseHunter you can be! 🐭️
      </Heading>

      <p className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
        Explore a curated collection of guides, extensions, tools, spreadsheets, and userscripts to help you hunt smarter, faster, and more efficiently.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Link
          href="/guides"
          className="block border border-pink-300 text-pink-700 dark:text-pink-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-pink-500 focus:outline-none"
          aria-label="Browse MouseHunt Guides"
        >
          <span className="block font-semibold text-lg mb-1">
            <AcademicCapIcon
              className="inline w-6 h-6 mr-2 align-middle text-pink-800 dark:text-pink-200 hover:text-pink-900 dark:hover:text-pink-300 shrink-0"
              aria-hidden="true"
            />
            MouseHunt Guides
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Learn strategies and tips from experienced hunters</span>
        </Link>
        <Link
          href="/extensions"
          className="block border border-cyan-300 text-cyan-700 dark:text-cyan-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          aria-label="Browse Browser Extensions"
        >
          <span className="block font-semibold text-lg mb-1">
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
          className="block border border-green-300 text-green-700 dark:text-green-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-green-500 focus:outline-none"
          aria-label="Browse Tools & Helpers"
        >
          <span className="block font-semibold text-lg mb-1">
            <WrenchIcon
              className="inline w-6 h-6 mr-2 align-middle text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-300 shrink-0"
              aria-hidden="true"
            />
            Tools & Helpers
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Utilities to optimize your hunting strategy</span>
        </Link>
        <Link
          href="/spreadsheets"
          className="block border border-blue-300 text-blue-700 dark:text-blue-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Browse Spreadsheets"
        >
          <span className="block font-semibold text-lg mb-1">
            <TableCellsIcon
              className="inline w-6 h-6 mr-2 align-middle text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-300 shrink-0"
              aria-hidden="true"
            />
            Spreadsheets
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Data-driven tools for advanced hunters</span>
        </Link>
      </div>

      <Divider className="my-16" />

      <section aria-labelledby="popular-items-heading" className="mt-16">
        <h2 id="popular-items-heading" className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Community Favorites
        </h2>
        <p className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Some of the most popular items in the community:
        </p>
        <ItemList items={items} />
      </section>
    </div>
  );
}
