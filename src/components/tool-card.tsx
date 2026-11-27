import clsx from 'clsx';
import { ArrowUpRightIcon } from '@heroicons/react/16/solid';
import React from 'react';

import { GameImage } from '@/components/game-image';
import { Link } from '@/components/link';

/** Soft backgrounds for a card's picture, so a page of cards has some colour without shouting. */
export const TINTS = {
  pink: 'bg-pink-50 ring-pink-100 dark:bg-pink-950/50 dark:ring-pink-900/60',
  amber: 'bg-amber-50 ring-amber-100 dark:bg-amber-950/40 dark:ring-amber-900/50',
  sky: 'bg-sky-50 ring-sky-100 dark:bg-sky-950/50 dark:ring-sky-900/60',
  green: 'bg-emerald-50 ring-emerald-100 dark:bg-emerald-950/50 dark:ring-emerald-900/60',
  violet: 'bg-violet-50 ring-violet-100 dark:bg-violet-950/50 dark:ring-violet-900/60',
} as const;

export type Tint = keyof typeof TINTS;

/** A tool, guide or page as a friendly card: the game's art on a soft tint, the name, and what it's for. */
export function ToolCard({
  href,
  title,
  description,
  image,
  tint = 'pink',
  external,
  headingLevel = 3,
}: {
  href: string;
  title: string;
  description: string;
  image?: string;
  tint?: Tint;
  /** Where an off-site link goes, shown in place of the picture's weight. */
  external?: string;
  headingLevel?: 2 | 3;
}) {
  const Title = `h${headingLevel}` as const;
  const className =
    'group flex h-full items-start gap-4 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-pink-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-pink-900';
  const body = (
    <>
      {image && (
        <span
          className={clsx(
            'flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset',
            TINTS[tint],
          )}
        >
          <GameImage src={image} width={40} height={40} className="size-10 object-contain drop-shadow-sm" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <Title className="text-base/6 font-semibold text-zinc-900 group-hover:text-pink-700 dark:text-white dark:group-hover:text-pink-300">
          {title}
        </Title>
        <span className="mt-1 block text-sm/6 text-pretty text-zinc-600 dark:text-zinc-400">{description}</span>
        {external && (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {external}
            <ArrowUpRightIcon className="size-3" aria-hidden="true" />
            <span className="sr-only">(another site)</span>
          </span>
        )}
      </span>
    </>
  );
  // Another site opens in a new tab, outside the app's router.
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
