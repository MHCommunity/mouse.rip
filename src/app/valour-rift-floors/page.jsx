'use client';

import { useRef, useState } from 'react';

import { Input, InputGroup } from '@/components/input';
import { Divider } from '@/components/divider';
import { Heading } from '@/components/heading';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default function ValourRiftFloors() {
  const orderUpcomingFloors = [
    'Puppetry', // Floor 1, 9, 17...
    'Thievery', // Floor 2, 10, 18...
    'Melee', // Floor 3, 11, 19...
    'Bard', // Floor 4, 12, 20...
    'Magic', // Floor 5, 13, 21...
    'Noble', // Floor 6, 14, 22...
    'Dusty', // Floor 7, 15, 23...
    'Eclipse', // Floor 8, 16, 24...
  ];

  const [currentFloor, setCurrentFloor] = useState('');
  const [reorderedFloors, setReorderedFloors] = useState(orderUpcomingFloors);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const input = parseInt(e.target.value, 10);
    setCurrentFloor(e.target.value);

    if (! isNaN(input) && input > 0) {
      const index = (input - 1) % orderUpcomingFloors.length;
      const reordered = [
        ...orderUpcomingFloors.slice(index),
        ...orderUpcomingFloors.slice(0, index),
      ];
      setReorderedFloors(reordered);
    } else {
      setReorderedFloors(orderUpcomingFloors);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Heading>Valour Rift Floors</Heading>

      <div className="relative flex items-center justify-center mt-2 mb-3 flex-col">
        <InputGroup>
          <MagnifyingGlassIcon />
          <Input
            placeholder="1, 2, 3, …"
            className="flex rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600"
            onFocus={() => inputRef.current?.focus()}
            onBlur={() => inputRef.current?.blur()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleInputChange(e);
              }
            }}
            ref={inputRef}
            onChange={handleInputChange}
            value={currentFloor}
          />
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Enter a floor number to reorder the list.
          </label>
        </InputGroup>
      </div>
      <div className="overflow-hidden">
        <ul>
          {reorderedFloors.map((floor, index) => (
            <li key={index} className="relative flex items-center justify-center gap-x-6 rounded-xl p-4 hover:bg-gray-100 flex-col">
              <div className="text-xl font-semibold tracking-tight text-balance text-gray-900 sm:text-3xl">
                {floor}
              </div>
              <div className="text-sm text-slate-500">
                Floors {index + 1}, {index + 9}, {index + 17}
              </div>
            </li>
          ))}
        </ul>
        <Divider className="my-4" />
      </div>
    </div>
  );
}
