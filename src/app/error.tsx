'use client';

import React, { useEffect } from 'react';

import { Heading } from '@/components/heading';
import { Link } from '@/components/site-link';

const buttonClasses =
  'rounded-lg px-4 py-2 text-sm font-semibold focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900';

/**
 * Shown in place of a page that threw while rendering, with the sidebar still there to leave by. Without it a
 * single bad value (a response that has changed shape, a script that failed to load after a deploy) blanks the
 * whole page behind the browser's "Application error".
 */
export default function PageError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl">
      <Heading>This page hit a snag</Heading>
      <p className="mt-3 text-base/7 text-zinc-700 dark:text-zinc-300">
        Something went wrong while showing it. Reloading usually fixes that, especially if the site was updated while
        you had it open.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={`${buttonClasses} bg-pink-600 text-white shadow-xs hover:bg-pink-700`}
        >
          Reload the page
        </button>
        <button
          type="button"
          onClick={() => retry()}
          className={`${buttonClasses} text-zinc-800 ring-1 ring-zinc-300 hover:ring-zinc-400 dark:text-zinc-200 dark:ring-zinc-700`}
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm font-medium text-pink-700 underline underline-offset-2 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
