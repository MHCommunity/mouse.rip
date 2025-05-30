import Image from 'next/image';
import Link from 'next/link';
import mice from '@/data/generated/mice.json';
import miceGroups from '@/data/generated/mice-groups.json';
import { Heading } from '@/components/heading';

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
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <Heading>
          MouseHunt Mice
        </Heading>
        <p className="max-w-3xl mx-auto mt-4 text-lg text-gray-600 dark:text-gray-300">
          View information and details about all the different mice in MouseHunt.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {sortedGroups.map((group) => {
          return (
            <Link
              key={group.id}
              href={`/mice/${group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
              className="block w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md group dark:bg-gray-800 dark:border-gray-700"
              aria-label={`View ${group.name} mice`}
            >
              <div className="relative h-20 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={`/images/mice-groups/${group.id}.jpg`}
                  alt={`${group.name} mice`}
                  fill
                  className="object-cover max-w-full group-hover:opacity-75 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-2xl font-bold text-white text-shadow group-hover:text-pink-300 transition-colors text-outline">
                    {group.name}
                  </h2>
                  <p className="text-gray-200 text-md">
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
