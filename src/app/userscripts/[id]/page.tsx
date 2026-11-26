import { notFound } from 'next/navigation';

import { getResourcesByCategory } from '@/lib/site-data';

import React from 'react';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { BadgeButton } from '@/components/badge';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';
import { pageMetadata } from '@/seo';

/** Only userscripts get a page here; other resources share the same id space. */
function getUserscript(id: string) {
  return getResourcesByCategory('userscript').find((item) => item.category === 'userscript' && item.id === id);
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = getUserscript(resolvedParams.id);

  if (!item) {
    return { title: 'Not Found' };
  }

  return pageMetadata({
    title: `${item.name} Userscript for MouseHunt`,
    description: item.description,
    path: `/userscripts/${resolvedParams.id}`,
  });
}

export function generateStaticParams() {
  const paths: { id: string }[] = getResourcesByCategory('userscript').map((item) => ({
    id: item.id,
  }));

  return paths;
}

export default async function UserscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  if (!resolvedParams || !resolvedParams.id) {
    notFound();
  }

  const item = getUserscript(resolvedParams.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumbs
        items={[{ name: 'Home', href: '/' }, { name: 'Userscripts', href: '/userscripts' }, { name: item.name }]}
      />

      <div className="mt-6">
        <PageHeader title={item.name} description={item.description} />
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...new Set(item.tags)].map((tag) => (
            <BadgeButton key={tag} href={`/userscripts/tags/${encodeURIComponent(tag)}`} color="zinc">
              {tag}
            </BadgeButton>
          ))}
        </div>
      )}

      {item.mhImproved && (
        <p className="mt-6 text-sm/6 text-zinc-600 dark:text-zinc-400">
          <PageLink href="https://github.com/MHCommunity/mousehunt-improved">MouseHunt Improved</PageLink> has this
          feature built in, so you don&apos;t need this script if you use it.
        </p>
      )}

      <div className="mt-6">
        {/* The install page is another site, so a plain outbound link (the shared Button's link mode breaks prerendering). */}
        <a
          href={item.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-pink-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900"
        >
          {item.source ? `Install via ${item.source}` : 'Install script'}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>

      <section
        aria-labelledby="how-to-heading"
        className="mt-10 rounded-2xl shadow-xs ring-1 ring-zinc-200 bg-white p-5 text-sm/6 text-zinc-700 sm:p-6 dark:ring-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      >
        <h2 id="how-to-heading" className="text-lg font-semibold text-zinc-950 dark:text-white">
          How to use MouseHunt userscripts
        </h2>
        <p className="mt-3">
          Userscripts are small pieces of code you install in your browser to change how a website behaves. To use this
          one:
        </p>
        <ol className="mt-3 list-inside list-decimal space-y-2">
          <li>
            Install a userscript manager for your browser:
            <ul className="mt-1 ml-5 list-inside list-disc space-y-1">
              <li>
                Chrome or Edge: <PageLink href="https://www.tampermonkey.net/">Tampermonkey</PageLink>. Then open its
                Details page in your browser’s extension settings and turn on Allow User Scripts, or scripts won’t run.
              </li>
              <li>
                Firefox: <PageLink href="https://violentmonkey.github.io/">Violentmonkey</PageLink> or Tampermonkey
              </li>
              <li>
                Android:{' '}
                <PageLink href="https://play.google.com/store/apps/details?id=org.mozilla.firefox">Firefox</PageLink>{' '}
                with Violentmonkey
              </li>
              <li>
                iOS: <PageLink href="https://itunes.apple.com/us/app/userscripts/id1463298887">Userscripts</PageLink>
              </li>
            </ul>
          </li>
          <li>
            Click the <strong className="font-semibold text-zinc-950 dark:text-white">install</strong> button above.
          </li>
          <li>Refresh the MouseHunt page to see the changes.</li>
        </ol>
      </section>
    </div>
  );
}
