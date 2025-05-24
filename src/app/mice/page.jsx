import Image from 'next/image';
import Link from 'next/link';
import mice from '@/data/generated/mice.json';
import miceGroups from '@/data/generated/mice-groups.json';
import { Heading } from '@/components/heading';

export const metadata = {
  title: 'Mice',
};

export default async function Mice() {
  // Group mice by group name
  const grouped = mice.reduce((acc, mouse) => {
    if (! acc[mouse.group]) {
      acc[mouse.group] = [];
    }
    acc[mouse.group].push(mouse);
    return acc;
  }, {});

  // Sort group names by their order in the miceGroups array
  const groupNames = Object.keys(grouped).sort((a, b) => {
    const indexA = miceGroups.findIndex((group) => group.name === a);
    const indexB = miceGroups.findIndex((group) => group.name === b);
    return indexA - indexB;
  });

  return (
    <>
      <Heading>MouseHunt Mice</Heading>
      <div className="space-y-8 mt-6">
        {groupNames.map((group) => (
          <div key={group}>
            <h2 className="text-xl font-semibold mb-2">{group}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {grouped[group]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((mouse) => (
                  <li key={mouse.type}>
                    <Link
                      href={`/mouse/${mouse.type.replace(/_/g, '-')}`}
                      className="pr-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm hover:bg-pink-100 dark:hover:bg-pink-900 transition min-h-[50px] flex items-center"
                    >
                      <Image
                        src={`/images/mice/thumbnail/${mouse.type.replace(/_/g, '-')}.png`}
                        alt={mouse.name}
                        width={50}
                        height={50}
                        className="inline-block mr-1"
                      />
                      {mouse.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
