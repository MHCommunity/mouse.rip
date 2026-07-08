import * as Headless from '@headlessui/react'
import React, { forwardRef } from 'react'
import { type LinkProps } from 'next/link'
import { Link as ViewTransitionLink } from 'next-view-transitions'

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return (
    <Headless.DataInteractive>
      <ViewTransitionLink {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
