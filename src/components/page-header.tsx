import clsx from 'clsx';
import React from 'react';

import { Heading } from '@/components/heading';
import { formatNumber } from '@/utils';

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  count?: number;
  countLabel?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconClassName?: string;
};

export function PageHeader({
  title,
  description,
  count,
  countLabel = 'items',
  icon: Icon,
  iconClassName,
}: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-zinc-200 pb-7 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        {Icon && (
          <span
            className={clsx(
              'flex size-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10',
              iconClassName,
            )}
          >
            <Icon className="size-7" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <Heading>{title}</Heading>
          {typeof count === 'number' && (
            <p className="mt-1 text-sm font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatNumber(count)} {countLabel}
            </p>
          )}
        </div>
      </div>
      {description && (
        <p className="mt-4 max-w-2xl text-base/7 text-pretty text-zinc-600 dark:text-zinc-300">{description}</p>
      )}
    </header>
  );
}
