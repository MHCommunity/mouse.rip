'use client';

import clsx from 'clsx';
import React, { useState } from 'react';

import { GameImage } from '@/components/game-image';
import { Input } from '@/components/input';
import { Link } from '@/components/link';
import { formatNumber } from '@/utils';

export interface RankTitle {
  id: string;
  name: string;
  /** Total wisdom needed to reach this title. */
  wisdom: number;
  image: string;
}

export interface WisdomMouse {
  name: string;
  wisdom: number;
  slug: string;
}

const labelClasses = 'flex flex-col gap-1.5 text-sm font-medium text-zinc-950 dark:text-white';
const hintClasses = 'text-xs font-normal text-zinc-600 dark:text-zinc-400';
const selectClasses =
  'w-full rounded-lg border border-zinc-950/10 bg-white px-3 py-2.5 text-base/6 text-zinc-950 shadow-sm hover:border-zinc-950/20 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 sm:py-1.5 sm:text-sm/6 dark:border-white/10 dark:bg-white/5 dark:text-white dark:scheme-dark dark:hover:border-white/20';

/** Digits only, with an optional decimal part when `decimal` is set. */
function cleanNumber(value: string, decimal = false): string {
  const stripped = value.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
  if (!decimal) return stripped;
  const [whole, ...rest] = stripped.split('.');
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole;
}

export function RankUpCalculator({ titles, mice }: { titles: RankTitle[]; mice: WisdomMouse[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(1);
  const [progress, setProgress] = useState('');
  const [exactWisdom, setExactWisdom] = useState('');
  const [mouseName, setMouseName] = useState('');

  const current = titles[currentIndex];
  const next = titles[currentIndex + 1];
  const target = titles[Math.max(targetIndex, currentIndex + 1)] ?? next;

  // Exact wisdom wins; otherwise place the hunter within their title from the progress percentage.
  const percent = Math.min(100, Number.parseFloat(progress) || 0);
  const wisdom = exactWisdom
    ? Number.parseInt(exactWisdom, 10)
    : current.wisdom + (next ? ((next.wisdom - current.wisdom) * percent) / 100 : 0);

  // Exact wisdom can be past the title picked, so read the title off the wisdom instead.
  const reached = titles.reduce((index, title, i) => (wisdom >= title.wisdom ? i : index), 0);
  const steps = target ? titles.slice(reached + 1, titles.indexOf(target) + 1) : [];
  const needed = target ? Math.max(0, Math.ceil(target.wisdom - wisdom)) : 0;

  const mouse = mice.find((m) => m.name.toLowerCase() === mouseName.trim().toLowerCase());

  const chooseCurrent = (index: number) => {
    setCurrentIndex(index);
    if (targetIndex <= index) setTargetIndex(index + 1);
  };

  return (
    <div className="space-y-8">
      <form className="space-y-5" aria-label="Your title and wisdom" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClasses}>
            Current title
            <select
              className={selectClasses}
              value={currentIndex}
              onChange={(e) => chooseCurrent(Number(e.target.value))}
            >
              {titles.map((title, index) => (
                <option key={title.id} value={index}>
                  {title.name}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Progress to the next title (%)
            <Input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 42.5"
              value={progress}
              disabled={Boolean(exactWisdom) || !next}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgress(cleanNumber(e.target.value, true))}
            />
          </label>

          <label className={labelClasses}>
            <span>
              Exact wisdom <span className={hintClasses}>(optional, replaces the title and progress)</span>
            </span>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 7,500,000"
              value={exactWisdom ? formatNumber(Number(exactWisdom)) : ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExactWisdom(cleanNumber(e.target.value))}
            />
          </label>

          <label className={labelClasses}>
            Target title
            <select
              className={selectClasses}
              value={target ? titles.indexOf(target) : ''}
              disabled={!next}
              onChange={(e) => setTargetIndex(Number(e.target.value))}
            >
              {titles.slice(currentIndex + 1).map((title) => (
                <option key={title.id} value={titles.indexOf(title)}>
                  {title.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>

      <section
        aria-live="polite"
        className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {!target ? (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {current.name} is the top title, so there&rsquo;s nowhere left to climb.
          </p>
        ) : needed === 0 ? (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            With {formatNumber(Math.floor(wisdom))} wisdom you&rsquo;ve already reached{' '}
            <strong className="font-semibold text-zinc-950 dark:text-white">{titles[reached].name}</strong>.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Wisdom needed for {target.name}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-white">
              {formatNumber(needed)}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              You have {formatNumber(Math.floor(wisdom))} of the {formatNumber(target.wisdom)} it takes.
            </p>

            <div className="mt-5 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <label className={clsx(labelClasses, 'max-w-sm')}>
                <span>
                  In catches of <span className={hintClasses}>(optional)</span>
                </span>
                <Input
                  type="text"
                  list="wisdom-mice"
                  autoComplete="off"
                  placeholder="Type a mouse, e.g. Glazy"
                  value={mouseName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMouseName(e.target.value)}
                />
                <datalist id="wisdom-mice">
                  {mice.map((m) => (
                    <option key={m.slug} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </datalist>
              </label>
              {mouse && (
                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <strong className="font-semibold text-zinc-950 dark:text-white">
                    {formatNumber(Math.ceil(needed / mouse.wisdom))}
                  </strong>{' '}
                  catches of{' '}
                  <Link
                    href={`/mice/${mouse.slug}`}
                    className="font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300"
                  >
                    {mouse.name}
                  </Link>
                  , at {formatNumber(mouse.wisdom)} wisdom each.
                </p>
              )}
            </div>
          </>
        )}
      </section>

      {target && needed > 0 && steps.length > 1 && (
        <section aria-labelledby="rank-steps-heading">
          <h2 id="rank-steps-heading" className="text-base/7 font-semibold text-zinc-900 dark:text-white">
            Titles on the way
          </h2>
          <ol className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {steps.map((title) => (
              <li key={title.id} className="flex items-center gap-3 px-4 py-2.5">
                <GameImage src={title.image} width={28} height={28} className="size-7 shrink-0" />
                <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{title.name}</span>
                <span className="text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  {formatNumber(Math.ceil(title.wisdom - wisdom))} more
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
