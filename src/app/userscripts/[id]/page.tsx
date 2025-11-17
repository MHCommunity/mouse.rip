import { notFound } from 'next/navigation';

import { getItem, getItemsByCategory } from '@/data';

import React from 'react';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Badge } from '@/components/badge';
import { formatNumber } from '@/utils';
import { Heading } from '@/components/heading';
import { Link } from '@/components/link';
import { PageLink } from '@/components/page-link';


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = getItem(resolvedParams.id);

  if (!item) {
    return { title: 'Not Found' };
  }

  return {
    title: `${item.name} Userscript for MouseHunt`,
    description: item.description,
  };
}

export function generateStaticParams() {
  const paths: { id: string }[] = getItemsByCategory('userscript').map((item) => ({
    id: item.id,
  }));

  return paths;
}

export default async function UserscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  if (!resolvedParams || !resolvedParams.id) {
    notFound();
  }

  // Fetch the item based on the ID from the params
  const item = getItem(resolvedParams.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
        {item.name}
      </h1>

      <div className="mb-4 text-lg text-gray-700 dark:text-gray-300">
        {item.description}
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} color="zinc">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mb-4 flex flex-wrap justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Installs</div>
          <div className="font-semibold text-gray-800 dark:text-gray-200">
            {item.data?.installs ? formatNumber(item.data.installs) : '?'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Active Users</div>
          <div className="font-semibold text-gray-800 dark:text-gray-200">
            {item.data?.active_users ? `~${formatNumber(item.data.active_users)}` : '?'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Version</div>
          <div className="font-semibold text-gray-800 dark:text-gray-200">
            {item.data?.version ? item.data.version : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Updated</div>
          <div className="font-semibold text-gray-800 dark:text-gray-200">
            {item.data?.updated_at ? new Date(item.data.updated_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : '-'}
          </div>
        </div>
      </div>

      <div className="my-6">
        <Link
          href={item.url || '#'}
          className="inline-flex items-center rounded bg-sky-600 px-4 py-2 text-base font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-offset-gray-800"
        >
          {item.source ? `Install via ${item.source}` : 'Install Script'}
          <ArrowRightIcon className="ml-2 size-5" aria-hidden="true" />
        </Link>
      </div>


      {/* How to Use Section */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm/6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Heading level={2} className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          How to use MouseHunt userscripts
        </Heading>
        <p className="mb-4 text-gray-700 dark:text-gray-200">
          Userscripts are small pieces of code that can be installed in your browser to modify the behavior of websites. They can be used to add new features, fix bugs, or update styles on websites like MouseHunt. If you want to use this userscript, follow these steps:
        </p>
        <ol className="ml-4 list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            Install a userscript manager for your browser:
            <ul className="ml-4 list-inside list-disc">
              <li>
                Chrome, Firefox, or Edge: <PageLink href="https://violentmonkey.github.io/">Violentmonkey</PageLink> (recommended) or <PageLink href="https://www.tampermonkey.net/">Tampermonkey</PageLink>
              </li>
              <li>
                Android: <PageLink href="https://kiwibrowser.com/">Kiwibrowser</PageLink>
              </li>
              <li>
                iOS: <PageLink href="https://itunes.apple.com/us/app/userscripts/id1463298887">Userscripts</PageLink>
              </li>
            </ul>
          </li>
          <li>
            Click the <strong>Install this script</strong> button above.
          </li>
          <li>
            Follow the prompts to install the userscript.
          </li>
          <li>
            Refresh the page to see the changes.
          </li>
        </ol>
      </div>
    </div>
  );
}
