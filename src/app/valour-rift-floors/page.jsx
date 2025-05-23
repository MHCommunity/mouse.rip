'use client';

import { useRef, useState } from 'react';
import { Input, InputGroup } from '@/components/input';
import { Divider } from '@/components/divider';
import { Heading } from '@/components/heading';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

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
    if (!floorNum || isNaN(floorNum) || floorNum < 1) {
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
    <div className="max-w-4xl mx-auto">
      <Heading>Valour Rift Floors</Heading>
      <div className="relative flex flex-col items-center justify-center mt-2 mb-3">
        <InputGroup>
          <MagnifyingGlassIcon />
          <Input
            id="floor-search"
            type="number"
            placeholder="1, 2, 3, …"
            className="flex bg-white rounded-md outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-gray-800 dark:outline-gray-700 dark:focus:outline-indigo-500"
            ref={inputRef}
            onChange={handleInputChange}
            value={currentFloor}
            inputMode="numeric"
            pattern="[0-9]*"
            aria-label="Floor number"
          />
        </InputGroup>
        <label htmlFor="floor-search" className="block mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter a floor number to reorder the list.
        </label>
      </div>
      <div className="overflow-hidden">
        <ul>
          {reorderedFloors.map((floor, index) => (
            <li
              key={floor.name}
              className="relative flex flex-col items-center justify-center p-4 gap-x-6 rounded-xl"
            >
              <div className="text-xl font-semibold tracking-tight text-gray-900 text-balance sm:text-3xl dark:text-gray-100">
                {floor.name}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Floors: {floor.floors.join(', ')}
              </div>
            </li>
          ))}
        </ul>
        <Divider className="my-4" />
      </div>
    </div>
  );
}
