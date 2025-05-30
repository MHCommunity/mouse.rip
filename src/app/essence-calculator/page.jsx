'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/input';
import { Heading } from '@/components/heading';
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
    <div className="max-w-4xl px-4 py-6 mx-auto">
      <Heading>Essence Calculator</Heading>

      <p className="p-4 mt-4 text-sm text-gray-800 rounded shadow bg-gray-50 dark:bg-gray-800 dark:text-gray-100">
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
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">Essence</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Current</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">From Crafting</th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Final Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900">
              {ESSENCES.map((essence, idx) => (
                <tr key={essence} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white sm:pl-6">
                    <div className="flex items-center">
                      <img
                        src={`/images/essence/${essence.toLowerCase()}.png`}
                        alt=""
                        className="flex-shrink-0 w-6 h-6 mr-2"
                        aria-hidden="true"
                      />
                      {essence} Essence
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-right text-gray-500 whitespace-nowrap dark:text-gray-400">
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
                  <td className="px-3 py-4 text-sm text-right text-gray-500 whitespace-nowrap dark:text-gray-400">
                    {craftableFromLower[idx] > 0 ? `+${craftableFromLower[idx]}` : ''}
                  </td>
                  <td className="px-3 py-4 text-sm font-medium text-right text-gray-900 whitespace-nowrap dark:text-gray-100">
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
            className="inline-flex items-center px-6 py-3 text-base font-semibold text-white rounded-md bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Calculate Final Counts
          </button>
        </div>
      </form>

      {finalCounts && (
        <div className="p-4 mt-6 text-gray-800 rounded shadow bg-gray-50 dark:bg-gray-800 dark:text-gray-100">
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
        <p className="p-4 mt-6 text-gray-800 rounded shadow bg-gray-50 dark:bg-gray-800 dark:text-gray-100">
          Did you know? It takes 6,561 Aleth Essence to craft 1 Icuri Essence.
        </p>
      )}

    </div>
  );
}
