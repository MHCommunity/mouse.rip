import clsx from 'clsx';
import React from 'react';
import colors from './colors';

export type BadgeProps = { color?: keyof typeof colors };

export function Badge({ color = 'zinc', className, ...props }: BadgeProps & React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline',
        colors[color],
      )}
    />
  );
}
