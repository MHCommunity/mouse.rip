import Link from 'next/link';
import { Heading } from '@/components/heading';
import { Divider } from '@/components/divider';
import { ItemList } from '@/components/item-list';
import { getPopularItems } from '@/data';

function HomeLink({ href, color, label, description }) {
  return (
    <Link
      href={href}
      className={`block border border-${color}-300 text-${color}-700 dark:text-${color}-400 rounded-lg p-5 transition hover:shadow-md hover:-translate-y-1 bg-white dark:bg-gray-900`}
    >
      <span className="block font-semibold text-lg mb-1">{label}</span>
      <span className="block text-sm text-gray-600 dark:text-gray-400">{description}</span>
    </Link>
  );
}

export const metadata = {
  title: 'MouseHunt Guides, Extensions, Tools, and Resources | mouse.rip',
};

export default function Home() {
  const items = getPopularItems();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Heading className="text-center mb-6">
        🐭 Master MouseHunt with Community Tools & Insights
      </Heading>

      <p className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
        Explore a curated collection of guides, extensions, tools, spreadsheets, and userscripts to help you hunt smarter, faster, and more efficiently.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <HomeLink href="/guides" color="pink" label="Guides" description="Strategies, location walkthroughs, and event tips." />
        <HomeLink href="/extensions" color="cyan" label="Extensions" description="Browser tools to enhance your gameplay." />
        <HomeLink href="/tools" color="green" label="Tools" description="Catch rate calculators, minluck tools, and more." />
        <HomeLink href="/spreadsheets" color="blue" label="Spreadsheets" description="Data-backed insights, loot tables, and tracking." />
      </div>

      <Divider className="my-16" />

      <div className="text-center text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8 ">
        Some of the most popular items in the community:
      </div>
      <ItemList items={items} />
    </div>
  );
}
