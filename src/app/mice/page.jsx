import Image from 'next/image';
import Link from 'next/link';

import { Heading } from '@/components/heading';

import mice from '@/data/generated/mice.json';
import miceGroups from '@/data/generated/mice-groups.json';

export const metadata = {
  title: 'MouseHunt Mice',
  description: 'Explore all the different mice in MouseHunt, from common rodents to legendary creatures.',
};

export default function Mice() {
  const sortedGroups = [...miceGroups].sort((a, b) => a.display_order - b.display_order);

  // Count mice in each group
  const mouseCounts = mice.reduce((acc, mouse) => {
    if (mouse.group) {
      acc[mouse.group] = (acc[mouse.group] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <Heading>
          MouseHunt Mice
        </Heading>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
          View information and details about all the different mice in MouseHunt.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {sortedGroups.map((group) => {
          return (
            <Link
              key={group.id}
              href={`/mice/${group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
              className="group block w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
              aria-label={`View ${group.name} mice`}
            >
              <div className="relative h-20 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={`/images/mice-groups/${group.id}.jpg`}
                  alt={`${group.name} mice`}
                  fill
                  className="max-w-full object-cover transition-transform duration-300 group-hover:opacity-75"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <Heading level={2} className="text-2xl font-bold text-white transition-colors group-hover:text-pink-300 dark:text-gray-100">
                    {group.name}
                  </Heading>
                  <p className="text-gray-200 dark:text-gray-400">
                    {`${mouseCounts[group.name] || 0} mice`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
