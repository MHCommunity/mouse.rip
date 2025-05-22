import { notFound } from 'next/navigation';

import { getItem, getItems } from '@/data';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Badge } from '@/components/badge';
import { Link } from '@/components/link';
import { PageLink } from '@/components/page-link';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getItem(id);

  return {
    title: `${item.name} User script for MouseHunt | mouse.rip`,
    description: item.description,
  };
}

export function generateStaticParams() {
  const paths = getItems().filter((item) => item.category === 'userscript').map((item) => ({
    id: item.id,
  }));

  return paths;
}

export default async function Location({ params }) {
  const { id } = await params;
  const item = await getItem(id);

  if (! item) {
    notFound();
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{item.name} Userscript for MouseHunt</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags && item.tags.map((tag) => (
            <Badge key={tag} id={tag} color="zinc">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Greasyfork-style info box */}
        <div className="flex flex-wrap gap-6 p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div>
            <div className="text-xs text-gray-500">Installs</div>
            <span className="font-semibold text-gray-700">
              {item.data.installs ? item.data.installs.toLocaleString() : '?'}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-500">Active Users</div>
            <span className="font-semibold text-gray-700">
              {item.data.active_users ? `~${item.data.active_users.toLocaleString()}` : '?'}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-500">Version</div>
            <span className="font-semibold text-gray-700">
              {item.data.version ? item.data.version : '-'}
            </span>
          </div>

          <div>
            <div className="text-xs text-gray-500">Updated</div>
            <span className="font-semibold text-gray-700">
              {item.data.updated_at ? new Date(item.data.updated_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '-'}
            </span>
          </div>

          <div>
            <div className="text-xs text-gray-500">Created</div>
            <span className="font-semibold text-gray-700">
              {item.data.created_at ? new Date(item.data.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '-'}
            </span>
          </div>
        </div>

        <div className="py-2 text-lg text-gray-800">
          {item.description}
        </div>
        <Link href={item.url} className="flex items-center text-blue-500 hover:text-blue-700">
          {item.source ? `View on ${item.source}` : 'View'}
          <ArrowRightIcon className="inline-block w-4 h-4 ml-1" aria-hidden="true" />
        </Link>
        {/* ...rest of your content... */}
        <div className="p-4 mt-6 bg-white border border-gray-200 shadow-sm rounded-lg text-sm/6">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            How to use User scripts for MouseHunt
          </h2>
          <p className="mb-4 text-gray-700">
            User scripts are small pieces of code that can be installed in your browser to modify the behavior of websites. They can be used to add new features, fix bugs, or update styles on websites like MouseHunt. If you want to use this user script, follow these steps:
          </p>
          <ol className="ml-4 space-y-2 text-gray-700 list-decimal list-inside">
            <li>
              Install a userscript manager for your browser:
              <ul className="ml-4 list-disc list-inside">
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
              Click the <strong>Install this script</strong> button on the user script page.
            </li>
            <li>
              Follow the prompts to install the user script.
            </li>
            <li>
              Refresh the page to see the changes.
            </li>
          </ol>
        </div>
      </div>
    </>
  );
}
