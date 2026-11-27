'use client';

import clsx from 'clsx';
import React, { createContext, useContext } from 'react';

import { useTimersContext } from '@/components/timers';
import { attractionStageName, stagesAt } from '@/lib/timers';

/** The attraction-data name of the stage running now at this location, or null until the timer loads. */
const LiveStageContext = createContext<string | null>(null);

/**
 * Reads the location's timer once for the whole mice list, from the page's
 * TimersProvider. Until it loads (or outside a rotating location, where there's
 * no provider), rows render exactly as the server sent them.
 */
export function LiveStageProvider({ locationName, children }: { locationName: string; children: React.ReactNode }) {
  const timers = useTimersContext();
  const state = timers?.state;
  const timer = state?.status === 'ready' ? state.data.locations.find((entry) => entry.name === locationName) : null;
  const current = timer && timers ? stagesAt(timer, timers.now)?.current : undefined;
  return (
    <LiveStageContext.Provider value={current ? attractionStageName(current.name) : null}>
      {children}
    </LiveStageContext.Provider>
  );
}

/**
 * A mouse row. When the location's timer is known and this mouse is best caught
 * in a different stage, its portrait greys out; rows for the running stage stay
 * as they are, since at most locations that's most of the list.
 */
export function LiveStageRow({
  stage,
  className,
  children,
}: {
  stage?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  const live = useContext(LiveStageContext);
  const offStage = Boolean(stage && live && stage !== live);
  return (
    <li className={clsx('group', className)} data-off-stage={offStage || undefined}>
      {children}
    </li>
  );
}

/** The row's stage, with a "not now" tag when a different stage is running. */
export function LiveStageLabel({ stage }: { stage: string }) {
  const live = useContext(LiveStageContext);
  return (
    <>
      {' during '}
      {stage}
      {live && live !== stage && (
        <span className="ml-1.5 inline-flex rounded-md bg-zinc-100 px-1.5 py-0.5 align-middle text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          not now
        </span>
      )}
    </>
  );
}

/** One line saying which stage is running, shown only when some mice here need another. */
export function LiveStageNote({ stages }: { stages: string[] }) {
  const live = useContext(LiveStageContext);
  if (!live || !stages.some((stage) => stage !== live)) return null;
  return (
    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
      <span className="font-medium text-zinc-900 dark:text-white">{live}</span> is running now. Mice best caught in
      another stage are grayed out.
    </p>
  );
}
