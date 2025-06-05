import Link from 'next/link';

import { AcademicCapIcon, BoltIcon, TableCellsIcon, WrenchIcon } from '@heroicons/react/20/solid';import { Heading } from '@/components/heading';

import { Divider } from '@/components/divider';
import { ItemList } from '@/components/item-list';

import { getPopularItems } from '@/data';

export const metadata = {
  title: 'MouseHunt Guides, Extensions, Tools, and Resources',
};

export default function Home() {
  const items = getPopularItems();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Heading className="mb-6 text-center">
        🐭️ Become the best MouseHunter you can be! 🐭️
      </Heading>

      <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-gray-700 dark:text-gray-300">
        Explore a curated collection of guides, extensions, tools, spreadsheets, and userscripts to help you hunt smarter, faster, and more efficiently.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/guides"
          className="block rounded-lg border border-pink-300 bg-white p-5 text-pink-700 transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-900 dark:text-pink-400"
          aria-label="Browse MouseHunt Guides"
        >
          <span className="mb-1 block text-lg font-semibold">
            <AcademicCapIcon
              className="mr-2 inline size-6 shrink-0 align-middle text-pink-800 hover:text-pink-900 dark:text-pink-200 dark:hover:text-pink-300"
              aria-hidden="true"
            />
            MouseHunt Guides
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Learn strategies and tips from experienced hunters</span>
        </Link>
        <Link
          href="/extensions"
          className="block rounded-lg border border-cyan-300 bg-white p-5 text-cyan-700 transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-900 dark:text-cyan-400"
          aria-label="Browse Browser Extensions"
        >
          <span className="mb-1 block text-lg font-semibold">
            <BoltIcon
              className="mr-2 inline size-6 shrink-0 align-middle text-cyan-800 hover:text-cyan-900 dark:text-cyan-200 dark:hover:text-cyan-300"
              aria-hidden="true"
            />
            Browser Extensions
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Enhance your browser with powerful MouseHunt tools</span>
        </Link>
        <Link
          href="/tools"
          className="block rounded-lg border border-green-300 bg-white p-5 text-green-700 transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900 dark:text-green-400"
          aria-label="Browse Tools & Helpers"
        >
          <span className="mb-1 block text-lg font-semibold">
            <WrenchIcon
              className="mr-2 inline size-6 shrink-0 align-middle text-green-800 hover:text-green-900 dark:text-green-200 dark:hover:text-green-300"
              aria-hidden="true"
            />
            Tools & Helpers
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Utilities to optimize your hunting strategy</span>
        </Link>
        <Link
          href="/spreadsheets"
          className="block rounded-lg border border-blue-300 bg-white p-5 text-blue-700 transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-blue-400"
          aria-label="Browse Spreadsheets"
        >
          <span className="mb-1 block text-lg font-semibold">
            <TableCellsIcon
              className="mr-2 inline size-6 shrink-0 align-middle text-blue-800 hover:text-blue-900 dark:text-blue-200 dark:hover:text-blue-300"
              aria-hidden="true"
            />
            Spreadsheets
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Data-driven tools for advanced hunters</span>
        </Link>
      </div>

      <Divider className="my-16" />

      <section className="mt-16">
        <Heading level={2} className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Community Favorites
        </Heading>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-gray-700 dark:text-gray-300">
          Some of the most popular items in the community:
        </p>
        <ItemList items={items} />
      </section>
    </div>
  );
}
