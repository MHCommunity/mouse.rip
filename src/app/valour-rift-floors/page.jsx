'use client';

import { useRef, useState } from 'react';

import { Input, InputGroup } from '@/components/input';
import { Heading } from '@/components/heading';

const FLOOR_ORDER = [
  { name: 'Puppetry', floors: [1, 9, 17] },
  { name: 'Thievery', floors: [2, 10, 18] },
  { name: 'Melee', floors: [3, 11, 19] },
  { name: 'Bard', floors: [4, 12, 20] },
  { name: 'Magic', floors: [5, 13, 21] },
  { name: 'Noble', floors: [6, 14, 22] },
  { name: 'Dusty', floors: [7, 15, 23] },
  { name: 'Eclipse', floors: [8, 16, 24] },
];

export default function ValourRiftFloors() {
  const [currentFloor, setCurrentFloor] = useState('');
  const [reorderedFloors, setReorderedFloors] = useState(FLOOR_ORDER);
  const inputRef = useRef(null);

  const reorderFloors = (floorNum) => {
    if (! floorNum || isNaN(floorNum) || floorNum < 1) {
      setReorderedFloors(FLOOR_ORDER);
      return;
    }
    const index = (floorNum - 1) % FLOOR_ORDER.length;
    setReorderedFloors([
      ...FLOOR_ORDER.slice(index),
      ...FLOOR_ORDER.slice(0, index),
    ]);
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setCurrentFloor(value);
    reorderFloors(Number(value));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Valour Rift Floors</Heading>
      <div className="relative mb-3 mt-2 flex flex-col items-center justify-center">
        <InputGroup>
          <Input
            id="floor-search"
            type="number"
            placeholder="1, 2, 3, …"
            className="flex rounded-md bg-white outline outline-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-gray-800 dark:outline-gray-700 dark:focus:outline-indigo-500"
            ref={inputRef}
            onChange={handleInputChange}
            value={currentFloor}
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Floor number"
          />
          <label htmlFor="floor-search" className="mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter a floor number to reorder the list.
          </label>
        </InputGroup>
      </div>
      <div className="overflow-hidden">
        <ul>
          {reorderedFloors.map((floor) => (
            <li
              key={floor.name}
              className="relative flex flex-col items-center justify-center gap-x-6 rounded-xl p-4"
            >
              <div className="text-balance text-xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-100">
                {floor.name}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Floors: {floor.floors.join(', ')}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
