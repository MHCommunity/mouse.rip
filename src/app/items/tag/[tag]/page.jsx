import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Heading } from '@/components/heading';

import { validTags } from '@/utils';

import items from '@/data/generated/items.json';

// Define nice display names and descriptions for each classification
export async function generateMetadata({ params }) {
  const tag = params.tag;

  return {
    title: `${tag} items`,
    description: `Information and details about ${tag} items in MouseHunt.`,
  };
}

export function generateStaticParams() {
  const tags = new Set();

  items.forEach((item) => {
    if (item.tags) {
      item.tags.forEach((tag) => {
        if (validTags.includes(tag)) {
          tags.add(tag);
        }
      });
    }
  });

  return Array.from(tags).map((tag) => ({
    tag,
  }));
}

export default function ItemTag({ params }) {
  const tag = items.find((item) => item.tags && item.tags.includes(params.tag));

  if (! tag) {
    notFound();
  }

  const filteredItems = items.filter((item) => item.tags && item.tags.includes(params.tag));
  const sortedItems = [...filteredItems].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center">
          <Link
            href="/items"
            className="inline-flex items-center text-sm font-medium text-pink-600 transition-colors hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200"
          >
            ← Back to Items
          </Link>
        </div>
        <div className="mt-4">
          <Heading className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {params.tag.charAt(0).toUpperCase() + params.tag.slice(1)} Items
          </Heading>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {sortedItems.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {sortedItems.map((item) => {
            const itemSlug = item.type.replace(/_/g, '-');

            return (
              <Link
                key={item.id}
                href={`/item/${itemSlug}`}
                className="group flex flex-row items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                aria-label={`View ${item.name}`}
              >
                <Image
                  src={item?.images?.large ? `/images/items/large/${itemSlug}.png` : `/images/items/thumbnail/${itemSlug}.png`}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="size-20"
                />
                <h3 className="line-clamp-2 p-4 font-medium text-gray-900 transition-colors group-hover:text-pink-600 dark:text-white dark:group-hover:text-pink-400">
                  {item.name}
                </h3>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
