'use client';
import Image from 'next/image';

import React, { useEffect, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';

import { formatNumber } from '@/utils';

const ESSENCES: string[] = ['Aleth', 'Ber', 'Cynd', 'Dol', 'Est', 'Fel', 'Gur', 'Hix', 'Icuri'];

/** Craft every 3 of an essence up into 1 of the next, all the way to Icuri. */
function calculateFinalEssences(base: number[]): number[] {
  const result = [...base];

  for (let i = 0; i < ESSENCES.length - 1; i++) {
    const craftable = Math.floor(result[i] / 3);
    result[i] = result[i] % 3;
    result[i + 1] += craftable;
  }

  return result;
}

/** How many of each essence can be crafted from the ones below it. */
function computeCraftables(base: number[]): number[] {
  const craftable = Array(ESSENCES.length).fill(0);
  const temp = [...base];

  for (let i = 0; i < ESSENCES.length - 1; i++) {
    craftable[i + 1] = Math.floor(temp[i] / 3);
    temp[i + 1] += craftable[i + 1];
    temp[i] = temp[i] % 3;
  }

  return craftable;
}

function Summary({ finalCounts }: { finalCounts: number[] }) {
  const highest = finalCounts
    .map((val, idx) => ({ idx, val }))
    .reverse()
    .find((e) => e.val > 0);

  if (!highest) {
    return <>You cannot craft any essences.</>;
  }

  const highestIdx = highest.idx;

  const remaining = finalCounts
    .map((val, idx) => ({ val, name: ESSENCES[idx] }))
    .filter((e, idx) => e.val > 0 && idx !== highestIdx)
    .reverse();

  const formattedRemaining = remaining.map((e) => `${formatNumber(e.val)} ${e.name}`).join(', ');
  const lastComma = formattedRemaining.lastIndexOf(', ');
  const prettyRemaining =
    lastComma !== -1
      ? formattedRemaining.slice(0, lastComma) + ' and' + formattedRemaining.slice(lastComma + 1)
      : formattedRemaining;

  return (
    <>
      You can craft{' '}
      <strong className="font-semibold text-zinc-950 dark:text-white">
        {formatNumber(highest.val)} {ESSENCES[highestIdx]}
      </strong>
      {remaining.length > 0 && <> with {prettyRemaining} remaining</>}.
    </>
  );
}

export default function EssenceCalculator() {
  const [amounts, setAmounts] = useState<string[]>(Array(ESSENCES.length).fill(''));

  const handleChange = (idx: number, value: string) => {
    const newAmounts = [...amounts];
    newAmounts[idx] = value.replace(/[^0-9]/g, '');
    setAmounts(newAmounts);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const text = e.clipboardData.getData('text');

      setAmounts((current) => {
        const newAmounts = [...current];
        ESSENCES.forEach((essence, idx) => {
          const regex = new RegExp(`(\\d+[\\d,]*)\\s+${essence} Essence`, 'i');
          const match = text.match(regex);
          if (match) {
            newAmounts[idx] = match[1].replace(/,/g, '');
          }
        });
        return newAmounts;
      });
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const base = amounts.map((a) => parseInt(a || '0', 10));
  const hasInput = amounts.some((a) => a !== '');
  const craftableFromLower = computeCraftables(base);
  const finalCounts = calculateFinalEssences(base);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Essence Calculator"
        description={
          <>
            Enter how many of each essence you have to see what they craft up into. You can also copy your amounts from
            the{' '}
            <PageLink href="https://www.mousehuntgame.com/inventory.php?tab=crafting&sub_tab=crafting_table">
              Crafting Table
            </PageLink>{' '}
            and paste them here with Ctrl+V (or Cmd+V).
          </>
        }
      />

      <form onSubmit={(e) => e.preventDefault()} aria-label="Essence amounts">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th
                  scope="col"
                  className="py-3 pr-3 pl-4 text-left text-sm font-semibold text-zinc-950 sm:pl-6 dark:text-white"
                >
                  Essence
                </th>
                <th scope="col" className="px-3 py-3 text-right text-sm font-semibold text-zinc-950 dark:text-white">
                  You have
                </th>
                <th
                  scope="col"
                  className="py-3 pr-4 pl-3 text-right text-sm font-semibold text-zinc-950 sm:pr-6 dark:text-white"
                >
                  Can craft
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {ESSENCES.map((essence, idx) => (
                <tr key={essence}>
                  <td className="py-2.5 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-zinc-950 sm:pl-6 dark:text-white">
                    <label htmlFor={`essence-${essence}`} className="flex items-center gap-2">
                      <Image
                        src={`/images/essence/${essence.toLowerCase()}.png`}
                        alt=""
                        width={24}
                        height={24}
                        className="size-6 shrink-0"
                        aria-hidden="true"
                      />
                      {essence}
                    </label>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Input
                      id={`essence-${essence}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={amounts[idx]}
                      placeholder="0"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(idx, e.target.value)}
                      className="ml-auto w-24 sm:w-28 [&_input]:text-right"
                    />
                  </td>
                  <td className="py-2.5 pr-4 pl-3 text-right text-sm tabular-nums text-zinc-600 sm:pr-6 dark:text-zinc-400">
                    {craftableFromLower[idx] > 0 ? formatNumber(craftableFromLower[idx]) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p aria-live="polite" className="text-base/7 text-zinc-700 dark:text-zinc-300">
          {hasInput ? <Summary finalCounts={finalCounts} /> : 'Enter your essence amounts to see what you can craft.'}
        </p>
        {hasInput && (
          <Button outline onClick={() => setAmounts(Array(ESSENCES.length).fill(''))}>
            Clear amounts
          </Button>
        )}
      </div>
    </div>
  );
}
