import { Badge } from '@/components/badge';
import { Link } from '@/components/link';
import { getItem, getItems } from '@/data';
import { notFound } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getItem(id);

  return {
    title: '{item.name} Userscript for MouseHunt',
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

  if (!item) {
    notFound();
  }

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{item.name} Userscript for MouseHunt</h1>
        <div>
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
          <div className="mt-6 rounded-2xl bg-gray-100 p-4 text-sm/6 border border-gray-300 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              How to use Userscripts for MouseHunt
            </h2>
            <p className="text-gray-700 mb-4">
              Userscripts are small pieces of code that can be installed in your browser to modify the behavior of websites. They can be used to add new features, fix bugs, or update styles on websites like MouseHunt. If you want to use this userscript, follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>
                Install a userscript manager for your browser:
                <ul className="list-disc list-inside ml-4">
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
      </div>
    </>
  );
}
