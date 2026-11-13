import clsx from 'clsx';

/**
 * Minluck bands, easiest to hardest: one red ramp from pale to deep. A single hue
 * reads as a difficulty scale and stays clear of the power-type chips, which use
 * sky, green, amber, blue, yellow, fuchsia, purple and teal.
 */
export const MINLUCK_BANDS = [
  {
    max: 9,
    label: 'Under 10',
    className:
      'bg-red-50 text-red-900 ring-1 ring-red-200 ring-inset dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900/60',
  },
  { max: 39, label: '10–39', className: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200' },
  { max: 99, label: '40–99', className: 'bg-red-200 text-red-950 dark:bg-red-900 dark:text-red-100' },
  { max: 300, label: '100–300', className: 'bg-red-600 text-white dark:bg-red-700 dark:text-white' },
  { max: Infinity, label: 'Over 300', className: 'bg-red-900 text-white dark:bg-red-400 dark:text-red-950' },
] as const;

function bandFor(value: number) {
  return MINLUCK_BANDS.find((band) => value <= band.max) ?? MINLUCK_BANDS[MINLUCK_BANDS.length - 1];
}

export function ColorScaleBadge({ value = 0, className = '' }: { value?: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span
      className={clsx(
        'inline-block min-w-9 rounded-md px-1.5 py-1 text-center text-sm font-medium tabular-nums',
        bandFor(rounded).className,
        className,
      )}
    >
      {rounded}
    </span>
  );
}

/** A compact key for the minluck colour bands. */
export function MinluckLegend({ className }: { className?: string }) {
  return (
    <ul
      className={clsx(
        'flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-600 dark:text-zinc-400',
        className,
      )}
    >
      <li className="font-medium text-zinc-700 dark:text-zinc-300">Minluck</li>
      {MINLUCK_BANDS.map((band) => (
        <li key={band.label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={clsx('size-3 rounded-sm', band.className)} />
          {band.label}
        </li>
      ))}
    </ul>
  );
}
