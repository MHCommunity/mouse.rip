'use client';

import { useEffect, useRef, useState } from 'react';

/** One stage of a rotating location (a tide, a season, a pollution level…). */
export interface TimerStage {
  name: string;
  /** Seasonal Garden: the power type that's strongest this season. */
  power_type?: string;
  /** Tides and Toxic Spill: "rising" or "falling". */
  note?: string;
  starts_at: string;
  ends_at: string;
}

export interface LocationTimer {
  id: string;
  name: string;
  current: TimerStage;
  upcoming: TimerStage[];
}

export interface TimersResponse {
  now: string;
  daily_reset: { at: string };
  locations: LocationTimer[];
}

/** api.mouse.rip names the Toxic Spill environment after its game id. */
const SITE_IDS: Record<string, string> = { pollution_outbreak: 'toxic-spill' };

export function timerLocationHref(timer: LocationTimer): string {
  return `/locations/${SITE_IDS[timer.id] ?? timer.id.replaceAll('_', '-')}`;
}

let cached: Promise<TimersResponse> | null = null;

/** Shared across every timer on the page; dropped after a failure so the next caller retries. */
function loadTimers(force = false): Promise<TimersResponse> {
  if (!cached || force) {
    cached = fetch('https://api.mouse.rip/timers')
      .then((response) => (response.ok ? (response.json() as Promise<TimersResponse>) : Promise.reject(response)))
      .catch((error) => {
        cached = null;
        throw error;
      });
  }
  return cached;
}

/**
 * The stage running at `now` and the ones after it. The API gives a few stages
 * ahead, so the countdown keeps working locally between fetches.
 */
export function stagesAt(timer: LocationTimer, now: number): { current: TimerStage; next: TimerStage[] } | null {
  const stages = [timer.current, ...timer.upcoming];
  const index = stages.findIndex((stage) => Date.parse(stage.ends_at) > now);
  if (index === -1) return null;
  return { current: stages[index], next: stages.slice(index + 1) };
}

type TimersState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: TimersResponse };

/**
 * Live timers plus a clock that ticks every 30 seconds. Re-fetches when a
 * location runs out of known stages, after the daily reset, and when the tab
 * comes back into view after a while away.
 */
export function useTimers(): { state: TimersState; now: number } {
  const [state, setState] = useState<TimersState>({ status: 'loading' });
  const [now, setNow] = useState(() => Date.now());
  const dataRef = useRef<TimersResponse | null>(null);

  useEffect(() => {
    let active = true;
    const load = (force: boolean) =>
      loadTimers(force).then(
        (data) => {
          if (!active) return;
          dataRef.current = data;
          setState({ status: 'ready', data });
        },
        // Keep showing what we had if a refresh fails.
        () => active && !dataRef.current && setState({ status: 'error' }),
      );
    load(false);

    let lastFetch = Date.now();
    const tick = () => {
      const time = Date.now();
      setNow(time);
      const data = dataRef.current;
      if (!data) return;
      const stale =
        data.locations.some((timer) => !stagesAt(timer, time)?.next.length) || Date.parse(data.daily_reset.at) <= time;
      // At most one refresh a minute, however stale.
      if (stale && time - lastFetch > 60_000) {
        lastFetch = time;
        load(true);
      }
    };
    const interval = window.setInterval(tick, 30_000);
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetch > 10 * 60_000) {
        lastFetch = Date.now();
        load(true);
      }
      tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { state, now };
}

/** "42m", "15h 3m", "3d 7h" — minute precision, which is all a hunter needs. */
export function formatCountdown(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

/** A local, readable time for a stage boundary, e.g. "Thu 11:00 AM". */
export function formatLocalTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  );
}

export function stageLabel(stage: TimerStage): string {
  return stage.note ? `${stage.name} (${stage.note})` : stage.name;
}
