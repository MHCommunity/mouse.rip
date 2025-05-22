import { notFound } from 'next/navigation';

import { getItem, getItems } from '@/data';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Badge } from '@/components/badge';
import { Link } from '@/components/link';

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
        <div className="py-2 text-lg text-gray-800">
          {item.description}
        </div>
        <Link href={item.url} className="flex items-center text-blue-500 hover:text-blue-700">
          {item.source ? `View on ${item.source}` : 'View'}
          <ArrowRightIcon className="inline-block w-4 h-4 ml-1" aria-hidden="true" />
        </Link>
        <div className="p-4 mt-6 bg-gray-100 border border-gray-300 shadow-sm rounded-2xl text-sm/6">
          <h2 className="mb-2 text-2xl font-semibold text-gray-900">
            How to use User scripts for MouseHunt
          </h2>
          <p className="mb-4 text-gray-700">
            User scripts are small pieces of code that can be installed in your browser to modify the behavior of websites. They can be used to add new features, fix bugs, or update styles on websites like MouseHunt. If you want to use this userscript, follow these steps:
          </p>
          <ol className="ml-4 space-y-2 text-gray-700 list-decimal list-inside">
            <li>
              Install a userscript manager for your browser:
              <ul className="ml-4 list-disc list-inside">
                <li>
                  Chrome, Firefox, or Edge: <a href="https://violentmonkey.github.io/" className="text-blue-500 hover:text-blue-700">Violentmonkey</a> (recommended) or <a href="https://www.tampermonkey.net/" className="text-blue-500 hover:text-blue-700">Tampermonkey</a>
                </li>
                <li>
                  Android: <a href="https://kiwibrowser.com/" className="text-blue-500 hover:text-blue-700">Kiwibrowser</a>
                </li>
                <li>
                  iOS: <a href="https://itunes.apple.com/us/app/userscripts/id1463298887" className="text-blue-500 hover:text-blue-700">Userscripts</a>
                </li>
              </ul>
            </li>
            <li>
              Click the <strong>Install this script</strong> button on the userscript page.
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
    </>
  );
}
