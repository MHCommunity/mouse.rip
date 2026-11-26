'use client';

import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useState, type ChangeEvent } from 'react';

import { Input } from '@/components/input';
import { BuildingOffice2Icon } from '@heroicons/react/20/solid';
import { formatNumber } from '@/utils';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';

interface FloorGroup {
  name: string;
  floors: number[];
}

const FLOOR_ORDER: FloorGroup[] = [
  { name: 'Puppetry', floors: [1, 9, 17] },
  { name: 'Thievery', floors: [2, 10, 18] },
  { name: 'Melee', floors: [3, 11, 19] },
  { name: 'Bard', floors: [4, 12, 20] },
  { name: 'Magic', floors: [5, 13, 21] },
  { name: 'Noble', floors: [6, 14, 22] },
  { name: 'Dusty', floors: [7, 15, 23] },
  { name: 'Eclipse', floors: [8, 16, 24] },
];

/** Rotate the cycle so the entered floor's type comes first. */
function reorderFloors(floorNum: number): FloorGroup[] {
  if (!floorNum || isNaN(floorNum) || floorNum < 1) {
    return FLOOR_ORDER;
  }
  const index = (floorNum - 1) % FLOOR_ORDER.length;
  return [...FLOOR_ORDER.slice(index), ...FLOOR_ORDER.slice(0, index)];
}

export default function ValourRiftFloorsPage() {
  return (
    <div className="max-w-2xl">
      <Breadcrumbs
        items={[{ name: 'Home', href: '/' }, { name: 'Tools', href: '/tools' }, { name: 'Valour Rift floors' }]}
      />
      <PageHeader
        title="Valour Rift floors"
        description="Floor types in the Valour Rift tower repeat in a cycle of eight. Enter your floor to see what's coming next."
        icon={BuildingOffice2Icon}
        iconClassName="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
      />
      {/* useSearchParams needs a Suspense boundary so the header can still be prerendered. */}
      {/* Until the link's floor is readable, show the full cycle rather than nothing. */}
      <Suspense fallback={<ValourRiftFloors initialFloor="" syncUrl={false} />}>
        <ValourRiftFloorsFromUrl />
      </Suspense>
    </div>
  );
}

function ValourRiftFloorsFromUrl() {
  const searchParams = useSearchParams();
  return <ValourRiftFloors initialFloor={(searchParams.get('floor') ?? '').replace(/\D/g, '')} syncUrl />;
}

function ValourRiftFloors({
  initialFloor,
  syncUrl,
}: {
  initialFloor: string;
  /** Off for the prerendered fallback, which mustn't rewrite a link it couldn't read. */
  syncUrl: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentFloor, setCurrentFloor] = useState(initialFloor);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setCurrentFloor(value);

    if (!syncUrl) return;
    const params = new URLSearchParams(window.location.search);
    if (value) params.set('floor', value);
    else params.delete('floor');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const floorNum = Number(currentFloor);
  const hasFloor = floorNum >= 1;
  const reorderedFloors = reorderFloors(floorNum);

  return (
    <>
      <div className="max-w-xs">
        <label htmlFor="floor-search" className="block text-sm font-medium text-zinc-950 dark:text-white">
          Current floor
        </label>
        <Input
          id="floor-search"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          placeholder="e.g. 12"
          className="mt-1.5"
          onChange={handleInputChange}
          value={currentFloor}
        />
      </div>

      <ol className="mt-6 divide-y divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-zinc-200 dark:divide-zinc-800 dark:bg-zinc-900 dark:ring-zinc-800">
        {reorderedFloors.map((floor, idx) => {
          const isCurrent = hasFloor && idx === 0;
          // From the entered floor, the next three floors of this type; otherwise the first three in the tower.
          const floors = hasFloor ? [0, 1, 2].map((lap) => floorNum + idx + lap * FLOOR_ORDER.length) : floor.floors;

          return (
            <li
              key={floor.name}
              aria-current={isCurrent ? 'step' : undefined}
              className={clsx(
                'flex items-baseline justify-between gap-4 px-4 py-3 sm:px-5',
                isCurrent && 'bg-pink-50 dark:bg-pink-950/30',
              )}
            >
              <span className="flex items-baseline gap-2">
                <span
                  className={clsx(
                    'text-base font-semibold',
                    isCurrent ? 'text-pink-700 dark:text-pink-300' : 'text-zinc-950 dark:text-white',
                  )}
                >
                  {floor.name}
                </span>
                {isCurrent && (
                  <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Floor {floorNum}</span>
                )}
              </span>
              <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                <span className="sr-only">Floors </span>
                {floors.map((number) => formatNumber(number)).join(', ')}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
