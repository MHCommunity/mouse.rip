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

/** A mouse row that lights up when the stage it's best in is the one running now. */
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
  const now = Boolean(stage && live && stage === live);
  return (
    <li className={clsx(className, now && 'bg-pink-50 dark:bg-pink-950/30')} data-live-stage={now || undefined}>
      {children}
    </li>
  );
}

/** The row's stage text, with a "Now" label when it's the running stage. */
export function LiveStageLabel({ stage }: { stage: string }) {
  const live = useContext(LiveStageContext);
  return (
    <>
      {' · '}
      {stage}
      {live === stage && (
        <span className="ml-1.5 inline-flex rounded-md bg-pink-100 px-1.5 py-0.5 align-middle text-xs font-medium text-pink-800 dark:bg-pink-900/60 dark:text-pink-200">
          Now
        </span>
      )}
    </>
  );
}
