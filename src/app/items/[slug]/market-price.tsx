'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { formatGold, formatSb } from '@/utils';
import { SectionHeading } from '@/components/section-heading';

export interface PricePoint {
  date: string;
  price: number;
  sb_price: number;
  volume: number | null;
}

interface MarkethuntResponse {
  item_info?: { item_id: number; name: string; currently_tradeable: boolean };
  market_data?: PricePoint[];
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: MarkethuntResponse }
  | { status: 'empty' }
  | { status: 'error' };

const RANGES = [
  { key: '90d', label: '90d', days: 90 },
  { key: '1y', label: '1y', days: 365 },
  { key: 'all', label: 'All', days: Number.POSITIVE_INFINITY },
] as const;

type RangeKey = (typeof RANGES)[number]['key'];

function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

// Chart geometry (SVG user units; the element itself is responsive).
const W = 640;
const H = 220;
const PRICE_TOP = 10;
const PRICE_BOTTOM = 168;
const VOL_TOP = 178;
const VOL_BOTTOM = 214;

export function PriceChart({ points }: { points: PricePoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const series = useMemo(() => {
    // Downsample long series so the path stays light; always keep the last point.
    if (points.length <= 400) return points;
    const stride = Math.ceil(points.length / 400);
    const sampled = points.filter((_, index) => index % stride === 0);
    if (sampled[sampled.length - 1] !== points[points.length - 1]) {
      sampled.push(points[points.length - 1]);
    }
    return sampled;
  }, [points]);

  const geometry = useMemo(() => {
    const prices = series.map((point) => point.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const step = series.length > 1 ? W / (series.length - 1) : W;
    const xFor = (index: number) => index * step;
    const yFor = (price: number) => PRICE_BOTTOM - ((price - min) / range) * (PRICE_BOTTOM - PRICE_TOP);

    const line = series
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${xFor(index).toFixed(1)},${yFor(point.price).toFixed(1)}`)
      .join(' ');
    const area = `${line} L${W},${PRICE_BOTTOM} L0,${PRICE_BOTTOM} Z`;

    const maxVolume = Math.max(...series.map((point) => point.volume ?? 0), 1);
    const up = series[series.length - 1].price >= series[0].price;

    return { min, max, xFor, yFor, line, area, maxVolume, up };
  }, [series]);

  const hovered = hoverIndex !== null ? series[hoverIndex] : null;

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    const index = Math.round(fraction * (series.length - 1));
    setHoverIndex(Math.min(series.length - 1, Math.max(0, index)));
  };

  const stroke = geometry.up ? '#059669' : '#e11d48';
  // Screen readers get the shape of the chart as a sentence, since the chart itself is visual only.
  const first = series[0];
  const last = series[series.length - 1];
  const summary = `Price history from ${first.date} to ${last.date}: ${formatGold(first.price)} to ${formatGold(
    last.price,
  )} gold, ranging ${formatGold(geometry.min)} to ${formatGold(geometry.max)}.`;

  return (
    <div>
      <div className="flex h-5 items-center justify-end gap-3 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
        {hovered ? (
          <>
            <span>{hovered.date}</span>
            <span className="font-medium text-zinc-700 dark:text-zinc-200">{formatGold(hovered.price)} gold</span>
            <span>{formatSb(hovered.sb_price)} SB</span>
            <span>{hovered.volume != null ? `${formatCompact(hovered.volume)} traded` : ''}</span>
          </>
        ) : (
          <span>
            {series[0].date} – {series[series.length - 1].date}
          </span>
        )}
      </div>
      <div className="relative mt-1">
        {/* Text lives in HTML, not the SVG: the SVG stretches to fit, which would distort it. */}
        {[geometry.max, (geometry.max + geometry.min) / 2, geometry.min].map((value, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute left-1 -translate-y-full text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400"
            style={{ top: `${(geometry.yFor(value) / H) * 100}%` }}
          >
            {formatCompact(value)}
          </span>
        ))}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={summary}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {/* Gridlines at min / mid / max */}
          {[geometry.max, (geometry.max + geometry.min) / 2, geometry.min].map((value, i) => (
            <g key={i}>
              <line
                x1={0}
                x2={W}
                y1={geometry.yFor(value)}
                y2={geometry.yFor(value)}
                className="stroke-zinc-200 dark:stroke-zinc-800"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </g>
          ))}

          <path d={geometry.area} fill={stroke} opacity={0.08} />
          <path
            d={geometry.line}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Volume bars */}
          {series.map((point, index) => {
            const volume = point.volume ?? 0;
            if (volume <= 0) return null;
            const height = (volume / geometry.maxVolume) * (VOL_BOTTOM - VOL_TOP);
            return (
              <rect
                key={index}
                x={geometry.xFor(index) - 1}
                y={VOL_BOTTOM - height}
                width={Math.max(2, W / series.length - 1)}
                height={height}
                className="fill-zinc-300 dark:fill-zinc-700"
              />
            );
          })}

          {/* Hover crosshair */}
          {hovered && hoverIndex !== null && (
            <g>
              <line
                x1={geometry.xFor(hoverIndex)}
                x2={geometry.xFor(hoverIndex)}
                y1={PRICE_TOP}
                y2={VOL_BOTTOM}
                className="stroke-zinc-400 dark:stroke-zinc-500"
                strokeWidth={1}
              />
              <circle cx={geometry.xFor(hoverIndex)} cy={geometry.yFor(hovered.price)} r={3.5} fill={stroke} />
            </g>
          )}
        </svg>
      </div>
      <div
        aria-hidden="true"
        className="mt-1 flex justify-between text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400"
      >
        <span>{series[0].date}</span>
        <span>{series[series.length - 1].date}</span>
      </div>
    </div>
  );
}

export function MarketPrice({ itemId }: { itemId: number }) {
  const [result, setResult] = useState<{ itemId: number; attempt: number; state: State } | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Don't leave the previous item's chart up while this one loads.
  const state: State = result?.itemId === itemId && result.attempt === attempt ? result.state : { status: 'loading' };

  useEffect(() => {
    let active = true;
    const setState = (next: State) => setResult({ itemId, attempt, state: next });
    fetch(`https://api.markethunt.win/items/${itemId}`)
      .then((res) => (res.ok ? (res.json() as Promise<MarkethuntResponse>) : Promise.reject()))
      .then((data) => {
        if (!active) return;
        if (!data.market_data || data.market_data.length === 0) {
          setState({ status: 'empty' });
        } else {
          setState({ status: 'ready', data });
        }
      })
      .catch(() => active && setState({ status: 'error' }));
    return () => {
      active = false;
    };
  }, [itemId, attempt]);

  // Items with no marketplace history get no section at all.
  if (state.status === 'empty') return null;

  return (
    <section className="mt-10">
      <SectionHeading>Marketplace price</SectionHeading>

      {state.status === 'loading' && (
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      )}

      {state.status === 'error' && (
        <p className="mt-4 rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
          Couldn&rsquo;t load prices from Markethunt.{' '}
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="font-medium text-pink-700 underline underline-offset-2 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
          >
            Try again
          </button>{' '}
          or{' '}
          <a
            href={`https://markethunt.win/?item_id=${itemId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-pink-700 underline underline-offset-2 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
          >
            open it on Markethunt
          </a>
          .
        </p>
      )}

      {state.status === 'ready' && <MarketCard itemId={itemId} data={state.data} />}
    </section>
  );
}

function MarketCard({ itemId, data }: { itemId: number; data: MarkethuntResponse }) {
  const series = data.market_data!;
  const [range, setRange] = useState<RangeKey>('90d');

  const latest = series[series.length - 1];
  const latestTime = new Date(latest.date).getTime();

  const window = useMemo(() => {
    const days = RANGES.find((option) => option.key === range)!.days;
    if (!Number.isFinite(days)) return series;
    const cutoff = latestTime - days * 86400000;
    const sliced = series.filter((point) => new Date(point.date).getTime() >= cutoff);
    return sliced.length > 1 ? sliced : series.slice(-2);
  }, [series, range, latestTime]);

  // Price ~30 days ago, by date, for the trend figure.
  const monthAgo = series.find((point) => new Date(point.date).getTime() >= latestTime - 30 * 86400000) ?? series[0];
  const change = monthAgo.price ? ((latest.price - monthAgo.price) / monthAgo.price) * 100 : 0;
  const up = change >= 0;

  const high = window.reduce((best, point) => (point.price > best.price ? point : best), window[0]);
  const low = window.reduce((best, point) => (point.price < best.price ? point : best), window[0]);

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-white">
            {formatGold(latest.price)}
            <span className="ml-1.5 text-base font-normal text-zinc-600 dark:text-zinc-400">gold</span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span
              className={
                up
                  ? 'font-medium text-emerald-600 dark:text-emerald-400'
                  : 'font-medium text-rose-600 dark:text-rose-400'
              }
            >
              <span aria-hidden="true">{up ? '▲' : '▼'}</span>
              <span className="sr-only">{up ? 'Up' : 'Down'}</span> {Math.abs(change).toFixed(1)}% over 30 days
            </span>
            {/* SUPER|brie+ priced in itself is always 1 SB; skip the noise. */}
            {Math.abs(latest.sb_price - 1) > 0.001 && (
              <span className="text-zinc-600 dark:text-zinc-400">{formatSb(latest.sb_price)} SB</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            role="group"
            aria-label="Chart range"
            className="flex items-center gap-1 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-800"
          >
            {RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                aria-pressed={range === option.key}
                className={`min-h-9 min-w-11 rounded-md px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 ${
                  range === option.key
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
            High {formatCompact(high.price)} ({high.date}) · Low {formatCompact(low.price)} ({low.date})
            {/* The chart's axis is fitted to this range, so say how wide it really is. */}
            {low.price > 0 && <> · {(((high.price - low.price) / low.price) * 100).toFixed(0)}% spread</>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <PriceChart points={window} />
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <span>
          <span className="block tabular-nums">
            {latest.volume != null ? `${formatGold(latest.volume)} traded` : 'Volume unavailable'} · as of {latest.date}
          </span>
          <span className="block">Data from Markethunt</span>
        </span>
        <a
          href={`https://markethunt.win/?item_id=${itemId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-pink-700 hover:text-pink-900 dark:text-pink-300 dark:hover:text-pink-200"
        >
          View on Markethunt →
        </a>
      </div>
    </div>
  );
}
