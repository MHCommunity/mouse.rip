import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Heading } from '@/components/heading';

import {
  classificationNames,
  classificationsNames,
  cleanDescription,
  formatBoolean,
  getClassification
} from '@/utils';

import items from '@/data/generated/items.json';

export async function generateMetadata({ params }) {
  const item = items.find((m) => m.type === params.id.replace(/-/g, '_'));
  return {
    title: `${item?.name || 'Item'}`,
  };
}

export function generateStaticParams() {
  return items.map((m) => ({ id: m.type.replace(/_/g, '-') }));
}

export default async function Item({ params }) {
  const itemType = params.id.replace(/-/g, '_');
  const item = items.find((m) => m.type === itemType);
  const classification = getClassification(item.classification);

  if (! item) {
    notFound();
  }

  const getItemImage = () => {
    const fileName = `${item.type.replace(/_/g, '-')}.png`;
    if (item.images.trap) {
      return `/images/items/trap/${fileName}`;
    } else if (item.images.large) {
      return `/images/items/large/${fileName}`;
    }

    return `/images/items/thumbnail/${fileName}`;
  };

  return (
    <div className="mx-auto max-w-4xl px-2 sm:px-6">
      <div className="mb-4">
        <Link
          href="/items"
          className="inline-flex items-center text-sm font-medium text-pink-600 transition-colors hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200"
        >
        ← Back to items
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link
          href={`/items/classification/${classification}`}
          className="text-sm text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-200"
        >
          {classificationsNames[classification] || classification}
        </Link>

      </div>

      <div className="flex flex-col items-start gap-6 md:flex-row md:gap-8">
        <div className="flex w-full justify-center md:block md:w-auto">
          <Image
            src={getItemImage(item)}
            alt={item.name}
            width={333}
            height={500}
            className="h-auto w-40 rounded-md border border-gray-300 shadow-md sm:w-56 md:w-64 dark:border-gray-700"
            priority
          />
        </div>

        <div className="w-full flex-1 space-y-3">
          <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-gray-100">
            {item.name}
          </h1>
          <Heading level={2} className="break-words text-lg font-semibold text-gray-800 sm:text-xl dark:text-gray-200">
            {item.group}
            {classificationNames[item.classification] ? ` ${classificationNames[item.classification]}` : ''}
          </Heading>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700 sm:mt-6 sm:grid-cols-3 dark:text-gray-300">
            <div>
              <span className="font-semibold">Tradable: </span>
              {formatBoolean(item.is_tradable)}
            </div>
            <div>
              <span className="font-semibold">Givable: </span>
              {formatBoolean(item.is_givable)}
            </div>
          </div>

          {item.is_limited_edition && (
            <div className="mt-4 text-sm font-semibold text-green-600 dark:text-green-400">
            Limited Edition!
            </div>
          )}

          <div className="whitespace-pre-line text-lg/6 text-gray-700 sm:text-base dark:text-gray-300">
            {cleanDescription(item.description)}
          </div>
        </div>
      </div>
    </div>
  );
}
