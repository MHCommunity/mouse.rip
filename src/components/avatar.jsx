import * as Headless from '@headlessui/react';
import clsx from 'clsx';
import Image from 'next/image';

import { forwardRef } from 'react';

import { Link } from './link';
import { TouchTarget } from './button';

export function Avatar({ src = null, square = false, initials, alt = '', icon, className, ...props }) {
  return (
    <span
      data-slot="avatar"
      {...props}
      className={clsx(
        className,
        // Basic layout
        'inline-grid shrink-0 align-middle [--avatar-radius:20%] [--ring-opacity:20%] *:col-start-1 *:row-start-1',
        'outline outline-1 -outline-offset-1 outline-black/[--ring-opacity] dark:outline-white/[--ring-opacity]',
        // Add the correct border radius
        square ? 'rounded-[--avatar-radius] *:rounded-[--avatar-radius]' : 'rounded-full *:rounded-full'
      )}
    >
      {icon && (
        <span className="flex size-full items-center justify-center text-[48px]">
          {icon}
        </span>
      )}
      {! icon && initials && (
        <svg
          className="size-full select-none fill-current p-[5%] text-[48px] font-medium uppercase"
          viewBox="0 0 100 100"
          aria-hidden={alt ? undefined : 'true'}
        >
          {alt && <title>{alt}</title>}
        </svg>
      )}
      {src && (
        <Image
          className="size-full"
          src={src}
          alt={alt}
          width={square ? 100 : undefined}
          height={square ? 100 : undefined}
        />
      )}
    </span>
  );
}

export const AvatarButton = forwardRef(function AvatarButton(
  { src, square = false, initials, alt, className, ...props },
  ref
) {
  const classes = clsx(
    className,
    square ? 'rounded-[20%]' : 'rounded-full',
    'relative inline-grid focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500'
  );

  return 'href' in props ? (
    <Link {...props} className={classes} ref={ref}>
      <TouchTarget>
        <Avatar src={src} square={square} initials={initials} alt={alt} />
      </TouchTarget>
    </Link>
  ) : (
    <Headless.Button {...props} className={classes} ref={ref}>
      <TouchTarget>
        <Avatar src={src} square={square} initials={initials} alt={alt} />
      </TouchTarget>
    </Headless.Button>
  );
});
