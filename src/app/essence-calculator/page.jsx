'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/input';
import { Heading } from '@/components/heading';
import { PageLink } from '@/components/page-link';

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
        Tip: You can copy your current amounts from the <PageLink href="https://www.mousehuntgame.com/inventory.php?tab=crafting&sub_tab=crafting_table">Crafting Table</PageLink> and hit paste to autofill the amounts.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          calculateFinalEssences();
        }}
        className="mt-4 space-y-4"
      >
        {ESSENCES.map((essence, idx) => (
          <div key={essence} className="flex flex-wrap items-center gap-4">
            <img
              src={`/images/essence-${essence.toLowerCase()}.png`}
              alt={`${essence} Essence`}
              className="w-12 h-12 mr-2"
              style={{ display: 'inline-block' }}
            />
            <label className="w-20 text-xl font-medium" htmlFor={essence}>
              {essence}
            </label>
            <Input
              type="number"
              min="0"
              value={amounts[idx]}
              onChange={(e) => handleChange(idx, e.target.value)}
              className="w-24"
            />
            <span className="text-sm text-gray-800 dark:text-gray-400" style={{ minWidth: '120px', display: 'inline-block' }}>
              {idx > 0 ? (
                <>
                  {craftableFromLower[idx].toLocaleString()} total craftable
                  <span className="hidden sm:inline"> from lower tiers</span>
                </>
              ) : (
                // Empty placeholder for alignment
                <span>&nbsp;</span>
              )}
            </span>
          </div>
        ))}

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 text-base font-semibold text-white rounded bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-800"
        >
          Calculate
        </button>
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
                return `${e.val.toLocaleString()} ${e.name}${separator}`;
              }).join('');

              return (
                <>
                  You can craft <strong>{highest.val.toLocaleString()}</strong> <strong>{ESSENCES[highestIdx]}</strong>
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
