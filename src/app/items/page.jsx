import Link from 'next/link';

import { Heading } from '@/components/heading';

import {
  classificationsNames,
  formatNumber,
  getClassification,
  validTags
} from '@/utils';

import items from '@/data/generated/items.json';

export const metadata = {
  title: 'MouseHunt Items',
  description: 'Explore all the different types of items in MouseHunt',
};

export default function Items() {
  // Count items in each classification
  const classificationCounts = items.reduce((acc, item) => {
    const classification = getClassification(item.classification);

    acc[classification] = (acc[classification] || 0) + 1;
    return acc;
  }, {});

  // Filter and sort classifications, with 'Other' at the end
  const sortedClassifications = Object.entries(classificationCounts)
    .filter(([key]) => key !== 'other')
    .sort((a, b) => {
      const orderA = Object.keys(classificationsNames).indexOf(a[0]);
      const orderB = Object.keys(classificationsNames).indexOf(b[0]);
      return orderA - orderB;
    })
    .concat(Object.entries(classificationCounts).filter(([key]) => key === 'other'));

  const tags = items.reduce((acc, item) => {
    if (item.tags) {
      item.tags.forEach((tag) => {
        if (validTags.includes(tag)) {
          acc[tag] = (acc[tag] || 0) + 1;
        }
      });
    }
    return acc;
  }, {});

  // Sort tags by count, descending
  const sortedTags = Object.entries(tags).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <Heading>
          MouseHunt Items
        </Heading>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          View information and details about all the different items in MouseHunt.
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {sortedTags.map(([tag, count]) => (
          <Link
            key={tag}
            href={`/items/tag/${tag}`}
            className="group block w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            aria-label={`View items tagged with ${tag}`}
          >
            <div className="p-6">
              <Heading level={2} className="text-xl font-bold text-gray-900 transition-colors group-hover:text-pink-500 dark:text-white">
                {tag}
              </Heading>
              <div className="items-center font-medium text-pink-800 dark:text-pink-200">
                {`${formatNumber(count)} items`}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* <div className="flex flex-col items-center gap-6"> */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {sortedClassifications.map(([key]) => (
          <Link
            key={key}
            href={`/items/classification/${key}`}
            className="group block w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            aria-label={`View ${classificationsNames[key] || key} items`}
          >
            <div className="p-6">
              <Heading level={2} className="text-xl font-bold text-gray-900 transition-colors group-hover:text-pink-500 dark:text-white">
                {classificationsNames[key] || key}
              </Heading>
              <div className="items-center  font-medium text-pink-800  dark:text-pink-200">
                {`${formatNumber(classificationCounts[key])} items`}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
