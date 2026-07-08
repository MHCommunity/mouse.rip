import React, { type ComponentPropsWithoutRef } from 'react';

type IconProps = ComponentPropsWithoutRef<'svg'>;

/** A little top-down mouse: teardrop body, round ears, curling tail. */
export function MouseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" {...props}>
      <path d="M5.9 3.1a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2Z" />
      <path d="M14.1 3.1a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2Z" />
      <path d="M10 1.9c2.93 2.87 4.4 5.53 4.4 8.4a4.4 4.4 0 1 1-8.8 0c0-2.87 1.47-5.53 4.4-8.4Z" />
      <path d="M9.7 13.6c.35 1.9 1.6 3.2 3.4 3.55 1.25.24 2.6.03 3.85-.62a.7.7 0 0 0-.64-1.24c-1 .5-2.03.67-2.95.5-1.23-.24-2.05-1.1-2.3-2.45a.7.7 0 0 0-1.36.26Z" />
    </svg>
  );
}

/** A wedge of cheese with holes. */
export function CheeseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.24 4.7c1.16-.6 2.51.28 2.51 1.55v7.5c0 .97-.78 1.75-1.75 1.75H3a1.9 1.9 0 0 1-.83-3.44L16.24 4.7ZM14.6 7.75a1.35 1.35 0 1 0 0 2.7 1.35 1.35 0 0 0 0-2.7ZM9.3 11.5a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm5.6.7a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z"
      />
    </svg>
  );
}
