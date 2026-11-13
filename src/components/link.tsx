'use client';

// Client-only: Headless UI's DataInteractive passes props to its child, which it
// can't do across the server/client boundary (prerendering fails with
// "Passing props on Fragment").
import * as Headless from '@headlessui/react';
import React, { forwardRef } from 'react';
import { type LinkProps } from 'next/link';
import { Link as ViewTransitionLink } from 'next-view-transitions';

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <Headless.DataInteractive>
      <ViewTransitionLink {...props} ref={ref} />
    </Headless.DataInteractive>
  );
});
