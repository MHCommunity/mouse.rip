'use client';

import clsx from 'clsx';
import React, { useState, type ChangeEvent } from 'react';

import { Input } from '@/components/input';
import { PageHeader } from '@/components/page-header';
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

const labelClasses = 'flex flex-col gap-1.5 text-sm font-medium text-zinc-950 dark:text-white';

const selectClasses =
  'w-full rounded-lg border border-zinc-950/10 bg-white px-3 py-2.5 text-base/6 text-zinc-950 shadow-sm hover:border-zinc-950/20 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 sm:py-1.5 sm:text-sm/6 dark:border-white/10 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/20';

const checkboxClasses =
  'size-4 shrink-0 rounded border-zinc-300 accent-pink-600 text-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:focus-visible:ring-offset-zinc-900';

const thClasses = 'px-3 py-3 text-right text-sm font-semibold text-zinc-950 dark:text-white';
const tdClasses = 'whitespace-nowrap px-3 py-3 text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-400';

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
    <div className="max-w-3xl">
      <PageHeader
        title="Queso Pump Calculator"
        description={
          <>
            Nachore upgrades the volcano pump in <PageLink href="/locations/queso-river">Queso Canyon</PageLink>.
            Enter how much Nachore you need to find the most time-efficient Queso to farm it with. Ported from
            fysh&apos;s original Queso Canyon Resource Calculator.
          </>
        }
      />

      <form className="space-y-5" aria-label="Queso pump calculator" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            Nachore wanted
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              placeholder="e.g. 1000"
              value={nachore}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNachore(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </label>

          <label className={labelClasses}>
            Pump level
            <select className={selectClasses} value={pumpLevel} onChange={(e) => setPumpLevel(Number(e.target.value))}>
              {PUMP_LEVELS.map((amount, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Level {idx + 1} — {amount} Bland Queso/catch
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="flex flex-col gap-y-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
          <legend className="sr-only">Boosts</legend>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={useMagicEssence}
              onChange={(e) => setUseMagicEssence(e.target.checked)}
              className={checkboxClasses}
            />
            Magic Essence (doubles cheese per craft)
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={useOesb}
              onChange={(e) => setUseOesb(e.target.checked)}
              className={checkboxClasses}
            />
            Overgrown Ember Stone Base (+50% pump)
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={useQpc}
              onChange={(e) => setUseQpc(e.target.checked)}
              className={checkboxClasses}
            />
            Queso Pump Charms (×2 pump)
          </label>
        </fieldset>
      </form>

      <p className="mt-5 text-sm/6 text-zinc-600 dark:text-zinc-400">
        Pumping <strong className="font-semibold text-zinc-950 dark:text-white">{basePump}</strong> Bland Queso per
        catch
        {boostedPump !== basePump && (
          <>
            {' '}
            (boosted to <strong className="font-semibold text-zinc-950 dark:text-white">{boostedPump}</strong>)
          </>
        )}
        .{' '}
        {nextNachore === null ? (
          <>Pump is at the maximum level.</>
        ) : (
          <>
            Next pump level needs{' '}
            <strong className="font-semibold text-zinc-950 dark:text-white">{formatNumber(nextNachore)}</strong>{' '}
            Nachore.
          </>
        )}
      </p>

      <div
        aria-live="polite"
        className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 text-base/7 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      >
        {best ? (
          <>
            <p>
              The most time-efficient strategy is{' '}
              <strong className="font-semibold text-zinc-950 dark:text-white">{best.name}</strong>, taking a minimum of{' '}
              <strong className="font-semibold text-zinc-950 dark:text-white">{formatNumber(best.hunts)}</strong> hunts
              {best.tier > 0 && (
                <>
                  {' '}
                  and{' '}
                  <strong className="font-semibold text-zinc-950 dark:text-white">
                    {formatNumber(best.blandQueso)}
                  </strong>{' '}
                  Bland Queso
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
              <p className="mt-1 text-sm/6 text-zinc-600 dark:text-zinc-400">
                Magic Essence {useMagicEssence ? 'saves' : 'would save'} {formatNumber(best.essenceSavedHunts)} hunts (
                {best.essenceSavedPercent.toFixed(2)}%).
              </p>
            )}
          </>
        ) : (
          <p>Enter the amount of Nachore you need to see the most efficient cheese strategy.</p>
        )}
      </div>

      {best && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th
                  scope="col"
                  className="py-3 pr-3 pl-4 text-left text-sm font-semibold text-zinc-950 sm:pl-6 dark:text-white"
                >
                  Cheese
                </th>
                <th scope="col" className={thClasses}>
                  Total hunts
                </th>
                <th scope="col" className={thClasses}>
                  Bland Queso
                </th>
                {useMagicEssence && (
                  <th scope="col" className={thClasses}>
                    Magic Essence
                  </th>
                )}
                {useQpc && (
                  <th scope="col" className={thClasses}>
                    Pump Charms
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {strategies.map((s) => {
                const isBest = s.tier === best.tier;

                return (
                  <tr key={s.tier} className={clsx(isBest && 'bg-pink-50 dark:bg-pink-950/30')}>
                    <td className="py-3 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-zinc-950 sm:pl-6 dark:text-white">
                      {s.name}
                      {isBest && (
                        <span className="ml-2 rounded-md bg-pink-600 px-1.5 py-0.5 text-xs font-semibold text-white">
                          Best
                        </span>
                      )}
                    </td>
                    <td className={clsx(tdClasses, 'text-zinc-950 dark:text-white')}>{formatNumber(s.hunts)}</td>
                    <td className={tdClasses}>{formatNumber(s.blandQueso)}</td>
                    {useMagicEssence && (
                      <td className={tdClasses}>{s.magicEssence > 0 ? formatNumber(s.magicEssence) : '—'}</td>
                    )}
                    {useQpc && <td className={tdClasses}>{formatNumber(s.pumpCharms)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
