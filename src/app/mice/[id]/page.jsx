import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import miceData from '@/data/generated/mice.json';
import miceGroupsData from '@/data/generated/mice-groups.json';

// Get mouse group data
function getMouseGroup(groupSlug) {
  // Convert URL slug to match group name (replace hyphens with spaces)
  const groupName = groupSlug.replace(/-/g, ' ');

  // Find the group in the data
  const group = miceGroupsData.find(
    (g) => g.name.toLowerCase() === groupName ||
         g.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ') === groupName
  );

  if (! group) {
    return null;
  }

  // Get all mice in this group
  const miceInGroup = miceData.filter((mouse) =>
    group.mouse_ids.includes(mouse.id)
  ).sort((a, b) => a.name.localeCompare(b.name));

  return {
    ...group,
    mice: miceInGroup
  };
}

// Generate static params for all mouse groups
export async function generateStaticParams() {
  return miceGroupsData.map((group) => ({
    id: group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  }));
}

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const group = getMouseGroup(params.id);

  if (! group) {
    return {
      title: 'Group Not Found | MouseHunt',
    };
  }

  const groupMice = `${group.name.includes('Mice') ? group.name : `${group.name} Mice`}`;
  return {
    title: `MouseHunt ${groupMice}`,
    description: `Explore all ${groupMice} in MouseHunt`,
  };
}

// This is a Server Component
export default function MouseGroupPage({ params }) {
  const group = getMouseGroup(params.id);

  if (! group) {
    notFound();
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Back button and title */}
      <div className="mb-8">
        <Link
          href="/mice"
          className="inline-flex items-center mb-4 text-sm font-medium text-pink-600 transition-colors dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-200"
        >
          ← Back to Mouse Groups
        </Link>

        <div className="relative overflow-hidden bg-gray-100 rounded-lg h-36 dark:bg-gray-700">
          <Image
            src={`/images/mice-groups/${group.id}.jpg`}
            alt={`${group.name} mice`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-2xl font-bold text-white transition-colors text-shadow group-hover:text-pink-300">
              {group.name}
            </h2>
            <p className="text-gray-200 text-md">
              {`${group.mice.length || 0} mice`}
            </p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {group.description}
          </p>
        </div>

      </div>

      <div className="container mx-auto ">
        {/* Mice grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {group.mice.map((mouse) => (
            <Link
              key={mouse.id}
              href={`/mouse/${mouse.type.replace(/_/g, '-')}`}
              className="flex flex-col py-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow transition-shadow duration-200 group hover:shadow-lg dark:border-gray-700"
            >
              <div className="relative h-48">
                <Image
                  src={mouse.images.large}
                  alt={mouse.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
              <h3 className="mt-3 font-medium text-center text-pink-600 transition-colors group-hover:text-pink-800">
                {mouse.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
