import * as Headless from '@headlessui/react';

import { forwardRef } from 'react';

import NextLink from 'next/link';

export const Link = forwardRef(function Link(props, ref) {
  return (
    <Headless.DataInteractive>
      <NextLink {...props} ref={ref} />
    </Headless.DataInteractive>
  );
});
