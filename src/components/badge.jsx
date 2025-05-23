import * as Headless from '@headlessui/react';
import clsx from 'clsx';

import { forwardRef } from 'react';
import { TouchTarget } from './button';
import { Link } from './link';

import colors from './colors';

export function Badge({ color = 'zinc', className, ...props }) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium forced-colors:outline',
        colors[`${color}Badge`]
      )}
    />
  );
}

export const BadgeButton = forwardRef(function BadgeButton(
  { color = 'zinc', className, children, ...props },

  ref
) {
  const classes = clsx(
    className,
    'group relative inline-flex rounded-md focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500'
  );

  return 'href' in props ? (
    <Link {...props} className={classes} ref={ref}>
      <TouchTarget>
        <Badge color={color}>{children}</Badge>
      </TouchTarget>
    </Link>
  ) : (
    <Headless.Button {...props} className={classes} ref={ref}>
      <TouchTarget>
        <Badge color={color}>{children}</Badge>
      </TouchTarget>
    </Headless.Button>
  );
});
