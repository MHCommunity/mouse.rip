import { notFound } from 'next/navigation';

import { getItem, getItemsByCategory } from '@/data';
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
  const paths = getItemsByCategory('userscript').map((item) => ({
    id: item.id,
  }));

  return paths;
}

export default async function Userscript({ params }) {
  const { id } = await params;
  const item = await getItem(id);

  if (! item) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Script Name */}
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{item.name}</h1>

      {/* Description */}
      <div className="text-lg text-gray-700 mb-4">{item.description}</div>

      {/* Install/View Button */}
      <div className="mb-6">
        <Link
          href={item.url}
          className="inline-flex items-center px-4 py-2 text-base font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          {item.source ? `Install via ${item.source}` : 'Install Script'}
          <ArrowRightIcon className="w-5 h-5 ml-2" aria-hidden="true" />
        </Link>
      </div>

      {/* Info Box */}
      <div className="flex flex-wrap p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm justify-between gap-4">
        <div>
          <div className="text-xs text-gray-500">Installs</div>
          <div className="font-semibold text-gray-800">
            {item.data.installs ? item.data.installs.toLocaleString() : '?'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Active Users</div>
          <div className="font-semibold text-gray-800">
            {item.data.active_users ? `~${item.data.active_users.toLocaleString()}` : '?'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Version</div>
          <div className="font-semibold text-gray-800">
            {item.data.version ? item.data.version : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Updated</div>
          <div className="font-semibold text-gray-800">
            {item.data.updated_at ? new Date(item.data.updated_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : '-'}
          </div>
        </div>
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {item.tags.map((tag) => (
            <Badge key={tag} id={tag} color="zinc">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* How to Use Section */}
      <div className="p-6 mt-8 bg-gray-50 border border-gray-200 shadow-sm rounded-lg text-sm/6">
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
            Click the <strong>Install this script</strong> button above.
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
  );
}
