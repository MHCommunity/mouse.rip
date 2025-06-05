'use client';
import Image from 'next/image';

import { useEffect, useState } from 'react';

import { Heading } from '@/components/heading';
import { Input } from '@/components/input';
import { PageLink } from '@/components/page-link';

import { formatNumber } from '@/utils';

const ESSENCES = [
  'Aleth',
  'Ber',
  'Cynd',
  'Dol',
  'Est',
  'Fel',
  'Gur',
  'Hix',
  'Icuri'
];

export default function EssenceCalculator() {
  const [amounts, setAmounts] = useState(Array(ESSENCES.length).fill(''));
  const [finalCounts, setFinalCounts] = useState(null);

  const handleChange = (idx, value) => {
    const newAmounts = [...amounts];
    newAmounts[idx] = value.replace(/[^0-9]/g, '');
    setAmounts(newAmounts);
  };

  const calculateFinalEssences = () => {
    const baseCounts = amounts.map((a) => parseInt(a || '0', 10));
    const result = [...baseCounts];

    for (let i = 0; i < ESSENCES.length - 1; i++) {
      const craftable = Math.floor(result[i] / 3);
      result[i] = result[i] % 3;
      result[i + 1] += craftable;
    }

    setFinalCounts(result);
  };

  const computeCraftables = () => {
    const base = amounts.map((a) => parseInt(a || '0', 10));
    const craftable = Array(ESSENCES.length).fill(0);
    const temp = [...base];

    for (let i = 0; i < ESSENCES.length - 1; i++) {
      craftable[i + 1] = Math.floor(temp[i] / 3);
      temp[i + 1] += craftable[i + 1];
      temp[i] = temp[i] % 3;
    }

    return craftable;
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const text = e.clipboardData.getData('text');
      const newAmounts = [...amounts];

      ESSENCES.forEach((essence, idx) => {
        const regex = new RegExp(`(\\d+[\\d,]*)\\s+${essence} Essence`, 'i');
        const match = text.match(regex);
        if (match) {
          newAmounts[idx] = match[1].replace(/,/g, '');
        }
      });

      setAmounts(newAmounts);
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [amounts]);

  const craftableFromLower = computeCraftables();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Heading>Essence Calculator</Heading>

      <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-800 shadow dark:bg-gray-800 dark:text-gray-100">
        Tip: You can copy your current amounts from the <PageLink href="https://www.mousehuntgame.com/inventory.php?tab=crafting&sub_tab=crafting_table">Crafting Table</PageLink> and press Ctrl+V (or Cmd+V) and the calculator will automatically fill out the amounts for each essence.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          calculateFinalEssences();
        }}
        className="mt-6 space-y-6"
        aria-label="Essence calculator form"
      >
        <div className="overflow-hidden shadow ring-1 ring-black md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100">Essence</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Current</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">From Crafting</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Final Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {ESSENCES.map((essence, idx) => (
                <tr key={essence} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                    <div className="flex items-center">
                      <Image
                        src={`/images/essence/${essence.toLowerCase()}.png`}
                        alt=""
                        width={24}
                        height={24}
                        className="mr-2 size-6 shrink-0"
                        aria-hidden="true"
                      />
                      {essence} Essence
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={amounts[idx]}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      className="w-24 text-right"
                      aria-label={`Amount of ${essence} Essence`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                    {craftableFromLower[idx] > 0 ? `+${craftableFromLower[idx]}` : ''}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {finalCounts ? finalCounts[idx] : amounts[idx] || '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-sky-600 px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:bg-sky-500 dark:hover:bg-sky-600 dark:focus:ring-offset-gray-800"
          >
            Calculate Final Counts
          </button>
        </div>
      </form>

      {finalCounts && (
        <div className="mt-6 rounded bg-gray-50 p-4 text-gray-800 shadow dark:bg-gray-800 dark:text-gray-100">
          <p>
            {(() => {
              const highest = finalCounts
                .map((val, idx) => ({ idx, val }))
                .reverse()
                .find((e) => e.val > 0);

              if (! highest) {
                return 'You cannot craft any essences.';
              }

              const highestIdx = highest.idx;

              const remaining = finalCounts
                .map((val, idx) => ({ val, name: ESSENCES[idx] }))
                .filter((e, idx) => e.val > 0 && idx !== highestIdx)
                .reverse();

              const formattedRemaining = remaining.map((e, i) => {
                const isSecondLast = i === remaining.length - 2;
                const isLast = i === remaining.length - 1;
                let separator = ', ';
                if (isLast) {
                  separator = '';
                } else if (isSecondLast) {
                  separator = ' and ';
                }
                return `${formatNumber(e.val)} ${e.name}${separator}`;
              }).join('');

              return (
                <>
                  You can craft <strong>{formatNumber(highest.val)}</strong> <strong>{ESSENCES[highestIdx]}</strong>
                  {remaining.length > 0 && <> with {formattedRemaining} remaining</>}
                  .
                </>
              );
            })()}
          </p>
        </div>
      )}

      {! finalCounts && (
        <p className="mt-6 rounded bg-gray-50 p-4 text-gray-800 shadow dark:bg-gray-800 dark:text-gray-100">
          Did you know? It takes 6,561 Aleth Essence to craft 1 Icuri Essence.
        </p>
      )}

    </div>
  );
}
