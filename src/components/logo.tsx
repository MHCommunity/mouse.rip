import clsx from 'clsx';
import Image from 'next/image';

import React, { type ComponentPropsWithoutRef } from 'react';

type LogoProps = ComponentPropsWithoutRef<'span'>

export function Logo({ className, ...props }: LogoProps) {
  return (
    <span
      data-slot="logo"
      {...props}
      className={clsx(
        className,
        'inline-grid shrink-0 rounded-full align-middle [--avatar-radius:20%] [--ring-opacity:20%] *:col-start-1 *:row-start-1 *:rounded-full'
      )}
    >
      <Image
        className="size-full max-h-6 max-w-6"
        src="/images/logo.png"
        alt="mouse.rip"
        width={24}
        height={24}
      />
      <span className="sr-only">mouse.rip</span>
    </span>
  );
}
