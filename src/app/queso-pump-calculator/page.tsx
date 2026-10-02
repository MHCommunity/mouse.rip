'use client';

import React, { useState, type ChangeEvent } from 'react';

import { Heading } from '@/components/heading';
import { Input } from '@/components/input';
import { PageLink } from '@/components/page-link';

import { formatNumber } from '@/utils';

import {
  bestStrategy,
  calculateStrategies,
  effectivePumpRate,
  NEXT_PUMP_NACHORE,
  PUMP_LEVELS,
  type PumpOptions,
} from './calc';

const selectClasses =
  'rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm font-medium text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100';

export default function QuesoPumpCalculator() {
  const [nachore, setNachore] = useState<string>('');
  const [pumpLevel, setPumpLevel] = useState<number>(1);
  const [useMagicEssence, setUseMagicEssence] = useState<boolean>(false);
  const [useOesb, setUseOesb] = useState<boolean>(false);
  const [useQpc, setUseQpc] = useState<boolean>(false);

  const options: PumpOptions = {
    nachore: parseInt(nachore || '0', 10),
    pumpLevel,
    useMagicEssence,
    useOesb,
    useQpc,
  };

  const strategies = calculateStrategies(options);
  const best = bestStrategy(strategies);

  const basePump = PUMP_LEVELS[pumpLevel - 1];
  const boostedPump = effectivePumpRate(options);
  const nextNachore = NEXT_PUMP_NACHORE[pumpLevel - 1];

  return (
    <div className="py-6">
      <Heading>Queso Pump Calculator</Heading>

      <p className="mt-4 rounded bg-gray-50 p-4 text-sm text-gray-800 shadow dark:bg-gray-800 dark:text-gray-100">
        Pumping the volcano in <PageLink href="/locations/queso-river">Queso Canyon</PageLink> costs Nachore. Enter how
        much Nachore you need and this works out the most time-efficient cheese to farm it with, comparing Bland Queso
        all the way up to Flamin&apos; Queso. Ported from fysh&apos;s original Queso Canyon Resource Calculator.
      </p>

      <form className="mt-6 space-y-5" aria-label="Queso pump calculator form" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nachore wanted
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              placeholder="e.g. 1000"
              value={nachore}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNachore(e.target.value.replace(/[^0-9]/g, ''))}
              aria-label="Nachore wanted"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Pump level
            <select
              className={selectClasses}
              value={pumpLevel}
              onChange={(e) => setPumpLevel(Number(e.target.value))}
              aria-label="Pump level"
            >
              {PUMP_LEVELS.map((amount, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Level {idx + 1} — {amount} Bland Queso/catch
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="flex flex-wrap gap-x-6 gap-y-2">
          <legend className="sr-only">Boosts</legend>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={useMagicEssence}
              onChange={(e) => setUseMagicEssence(e.target.checked)}
              className="size-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            Using Magic Essence (doubles cheese per craft)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={useOesb}
              onChange={(e) => setUseOesb(e.target.checked)}
              className="size-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            Overgrown Ember Stone Base (+50% pump)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={useQpc}
              onChange={(e) => setUseQpc(e.target.checked)}
              className="size-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            Queso Pump Charms (×2 pump)
          </label>
        </fieldset>
      </form>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Pumping <strong>{basePump}</strong> Bland Queso per catch
        {boostedPump !== basePump && (
          <>
            {' '}
            (boosted to <strong>{boostedPump}</strong>)
          </>
        )}
        .{' '}
        {nextNachore === null ? (
          <>Pump is at the maximum level.</>
        ) : (
          <>
            Next pump level needs <strong>{formatNumber(nextNachore)}</strong> Nachore.
          </>
        )}
      </p>

      {best ? (
        <>
          <div className="mt-6 rounded bg-emerald-50 p-4 text-emerald-900 shadow dark:bg-emerald-950/60 dark:text-emerald-100">
            <p>
              The most time-efficient strategy is <strong>{best.name}</strong>, taking a minimum of{' '}
              <strong>{formatNumber(best.hunts)}</strong> hunts
              {best.tier > 0 && (
                <>
                  {' '}
                  and <strong>{formatNumber(best.blandQueso)}</strong> Bland Queso
                  {useMagicEssence && best.magicEssence > 0 && <>, {formatNumber(best.magicEssence)} Magic Essence</>}
                  {useQpc && (
                    <>
                      , {formatNumber(best.pumpCharms)} Queso Pump Charm{best.pumpCharms === 1 ? '' : 's'}
                    </>
                  )}
                </>
              )}
              .
            </p>
            {best.essenceSavedHunts > 0 && (
              <p className="mt-1 text-sm">
                {useMagicEssence ? 'Using' : 'Not using'} Magic Essence {useMagicEssence ? 'saves' : 'costs'} you{' '}
                {formatNumber(best.essenceSavedHunts)} hunts ({best.essenceSavedPercent.toFixed(2)}%) versus the
                alternative.
              </p>
            )}
          </div>

          <div className="mt-6 overflow-hidden shadow md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100"
                  >
                    Cheese
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100"
                  >
                    Total hunts
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100"
                  >
                    Bland Queso
                  </th>
                  {useMagicEssence && (
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Magic Essence
                    </th>
                  )}
                  {useQpc && (
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-gray-100"
                    >
                      Pump Charms
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {strategies.map((s) => (
                  <tr
                    key={s.tier}
                    className={
                      s.tier === best.tier
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 dark:text-white">
                      {s.name}
                      {s.tier === best.tier && (
                        <span className="ml-2 rounded bg-emerald-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                          best
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
                      {formatNumber(s.hunts)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm tabular-nums text-gray-500 dark:text-gray-400">
                      {formatNumber(s.blandQueso)}
                    </td>
                    {useMagicEssence && (
                      <td className="whitespace-nowrap px-3 py-4 text-right text-sm tabular-nums text-gray-500 dark:text-gray-400">
                        {s.magicEssence > 0 ? formatNumber(s.magicEssence) : '—'}
                      </td>
                    )}
                    {useQpc && (
                      <td className="whitespace-nowrap px-3 py-4 text-right text-sm tabular-nums text-gray-500 dark:text-gray-400">
                        {formatNumber(s.pumpCharms)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="mt-6 rounded bg-gray-50 p-4 text-gray-800 shadow dark:bg-gray-800 dark:text-gray-100">
          Enter the amount of Nachore you need to see the most efficient cheese strategy.
        </p>
      )}
    </div>
  );
}
