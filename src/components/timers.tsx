'use client';

import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import React from 'react';

import { POWER_TYPE_CHIP, powerTypeLabel } from '@/lib/power-types';
import {
  formatCountdown,
  formatLocalTime,
  stageLabel,
  stagesAt,
  timerLocationHref,
  useTimers,
  type TimerStage,
} from '@/lib/timers';

function PowerChip({ type }: { type?: string }) {
  if (!type) return null;
  return (
    <span className={clsx('inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium', POWER_TYPE_CHIP[type])}>
      {powerTypeLabel(type)}
    </span>
  );
}

/** Tides and Toxic Spill: whether the level is rising or falling. */
function NoteText({ note }: { note: string }) {
  return (
    <>
      <span className="font-medium text-zinc-800 dark:text-zinc-200">
        {note.charAt(0).toUpperCase() + note.slice(1)}
      </span>
      {' · '}
    </>
  );
}

function EndsIn({ stage, now, prefix = 'ends in' }: { stage: TimerStage; now: number; prefix?: string }) {
  return (
    <time dateTime={stage.ends_at} title={formatLocalTime(stage.ends_at)} className="tabular-nums">
      {prefix} {formatCountdown(Date.parse(stage.ends_at) - now)}
    </time>
  );
}

/**
 * The rotating locations at a glance: what's on now, how long it lasts, and
 * what comes next. For the home page.
 */
export function TimersStrip({ className }: { className?: string }) {
  const { state, now } = useTimers();

  return (
    <section aria-labelledby="timers-heading" className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="timers-heading" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Right now
        </h2>
        {state.status === 'ready' && (
          <p className="text-sm text-zinc-600 sm:text-xs dark:text-zinc-400">
            Daily reset in{' '}
            <time
              dateTime={state.data.daily_reset.at}
              title={formatLocalTime(state.data.daily_reset.at)}
              className="font-medium text-zinc-800 tabular-nums dark:text-zinc-200"
            >
              {formatCountdown(Date.parse(state.data.daily_reset.at) - now)}
            </time>
          </p>
        )}
      </div>

      {state.status === 'error' ? (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Location timers are unavailable right now.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4" aria-busy={state.status === 'loading'}>
          {state.status === 'loading'
            ? [0, 1, 2, 3].map((index) => (
                <li key={index} className="h-[92px] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              ))
            : state.data.locations.map((timer) => {
                const stages = stagesAt(timer, now);
                if (!stages) return null;
                const next = stages.next[0];
                return (
                  <li key={timer.id}>
                    <Link
                      href={timerLocationHref(timer)}
                      className="group flex h-full flex-col rounded-lg border border-zinc-200 bg-white px-3.5 py-3 transition-colors hover:border-pink-300 hover:bg-pink-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-800 dark:hover:bg-pink-950/20"
                    >
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">{timer.name}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-zinc-900 group-hover:text-pink-700 dark:text-zinc-100 dark:group-hover:text-pink-300">
                          {stages.current.name}
                        </span>
                        <PowerChip type={stages.current.power_type} />
                      </span>
                      <span className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {/* Rising/falling rides in this line, so a long stage name doesn't push a label onto its own row. */}
                        {stages.current.note && <NoteText note={stages.current.note} />}
                        <EndsIn stage={stages.current} now={now} />
                        {next && next.name !== stages.current.name && <> · next: {next.name}</>}
                        {next && next.name === stages.current.name && next.note && <> · next: {next.note}</>}
                      </span>
                    </Link>
                  </li>
                );
              })}
        </ul>
      )}
    </section>
  );
}

/** The current stage of one rotating location and the next few, for its location page. */
export function LocationTimerPanel({ locationName }: { locationName: string }) {
  const { state, now } = useTimers();
  const timer = state.status === 'ready' ? state.data.locations.find((entry) => entry.name === locationName) : null;
  const stages = timer ? stagesAt(timer, now) : null;

  return (
    <section
      aria-labelledby="timer-heading"
      className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      <h2 id="timer-heading" className="sr-only">
        {locationName} timer
      </h2>
      {state.status === 'loading' && <div className="h-[104px] animate-pulse rounded-lg" aria-busy="true" />}
      {(state.status === 'error' || (state.status === 'ready' && !stages)) && (
        <p className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
          This location&rsquo;s timer is unavailable right now.
        </p>
      )}
      {stages && (
        <div className="grid divide-y divide-zinc-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-zinc-800">
          <div className="px-4 py-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Right now</p>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-zinc-900 dark:text-white">{stageLabel(stages.current)}</span>
              <PowerChip type={stages.current.power_type} />
            </p>
            <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
              <EndsIn stage={stages.current} now={now} prefix="Ends in" />
            </p>
          </div>
          {stages.next.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Coming up</p>
              <ol className="mt-1 space-y-1 text-sm">
                {stages.next.slice(0, 3).map((stage) => (
                  <li key={stage.starts_at} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                      {stageLabel(stage)}
                      <PowerChip type={stage.power_type} />
                    </span>
                    <time
                      dateTime={stage.starts_at}
                      className="text-zinc-600 tabular-nums dark:text-zinc-400"
                      title={formatLocalTime(stage.starts_at)}
                    >
                      in {formatCountdown(Date.parse(stage.starts_at) - now)}
                    </time>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
