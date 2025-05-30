import clsx from 'clsx';

import colors from './colors';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Badge } from '@/components/badge';

export function Item({ item, ...props }) {
  const itemLink = item.category === 'userscript' ? `/userscripts/${item.id}` : item.url;
  const itemText = item.source ? `View on ${item.source}` : 'View';

  return (
    <div
      className={clsx(
        'text-sm font-medium text-gray-700 border border-gray-400/50 rounded-md shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition hover:shadow-md hover:-translate-y-1',
        colors[item.category]
      )}
      {...props}
    >
      <div className="flex flex-col justify-between flex-1 h-full gap-2 p-3">
        <a
          href={itemLink}
          title={itemText}
        >
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {item.name}
          </h1>
        </a>
        <div className="text-gray-700 dark:text-zinc-200">
          {item.description}
        </div>
        {item.tags && props.showtags && (
          <div className="flex flex-wrap items-end gap-x-2">
            {item.tags.map((tag) => (
              <Badge key={tag} id={tag} color="zinc">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex justify-between">
          {item.category && (
            <Badge key={item.category} id={`${item.id}-${item.category}`} color={item.category}>
              {item.category}
            </Badge>
          )}
          <a
            href={itemLink}
            title={itemText}
            className={clsx(
              'text-sm font-semibold text-sky-700 dark:text-sky-200 hover:text-sky-900 dark:hover:text-white drop-shadow-sm',
              item.source ? 'flex items-center' : 'text-right'
            )}
          >
            {item.source && 'userscript' !== item.category ? `Go to ${item.source}` : 'View'}
            <ArrowRightIcon className="inline-block w-4 h-4 ml-1" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
