import clsx from 'clsx';
import Link from 'next/link';

import colors from './colors';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Badge } from '@/components/badge';

export function Item({ item, ...props }) {
  return (
    <Link
      href={item.category === 'userscript' ? `/userscripts/${item.id}` : item.url}
      className={clsx(
        'flex flex-col px-3 py-4 space-y-4 text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
        colors[item.category]
      )}
      {...props}
    >
      <div className="flex flex-col flex-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {item.name}
        </h1>
        <div className="mt-2 text-gray-700 dark:text-gray-300">
          {item.description}
        </div>
      </div>
      {item.tags && (
        <div className="flex flex-wrap gap-x-2 items-end">
          {item.tags.map((tag) => (
            <Badge key={tag} id={tag} color="zinc">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      <div className="flex items-end justify-between mt-4">
        {item.category && (
          <Badge key={item.category} id={item.category} color={item.category}>
            {item.category}
          </Badge>
        )}
        <span className="flex items-center text-sky-500 dark:text-sky-200 hover:text-sky-700 dark:hover:text-sky-300">
          {item.source ? `View on ${item.source}` : 'View'}
          <ArrowRightIcon className="inline-block w-4 h-4 ml-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
