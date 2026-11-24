import { Subheading } from '@/components/heading';
import { PageHeader } from '@/components/page-header';
import { PageLink } from '@/components/page-link';
import { pageMetadata } from '@/seo';

import React from 'react';

export const metadata = pageMetadata({
  title: 'About mouse.rip',
  description:
    'mouse.rip is a community-built MouseHunt site with guides, a mouse and item database, minlucks, calculators, and links to community tools.',
  path: '/about',
});

const features: { href: string; name: string; description: string }[] = [
  { href: '/guides', name: 'Guides', description: 'from your first hunt to endgame strategy.' },
  {
    href: '/mice',
    name: 'Mice',
    description: 'every mouse, with stats, minlucks, attraction rates, and where to catch it.',
  },
  { href: '/items', name: 'Items', description: 'every item, with drop sources and marketplace prices.' },
  { href: '/minlucks', name: 'Minlucks', description: 'the luck you need to guarantee a catch with each power type.' },
  {
    href: '/essence-calculator',
    name: 'Essence calculator',
    description: 'what your essences craft into.',
  },
  {
    href: '/queso-pump-calculator',
    name: 'Queso pump calculator',
    description: 'the fastest cheese for farming Nachore.',
  },
  { href: '/valour-rift-floors', name: 'Valour Rift floors', description: 'which floor types come next.' },
  { href: '/tools', name: 'Tools', description: 'community calculators, simulators, and planners.' },
  { href: '/extensions', name: 'Extensions', description: 'browser add-ons for the game.' },
  { href: '/userscripts', name: 'Userscripts', description: 'small scripts that tweak the game page.' },
  { href: '/spreadsheets', name: 'Spreadsheets', description: 'trackers and number-crunching sheets.' },
];

export default async function About() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="About mouse.rip"
        description="mouse.rip collects MouseHunt guides, game data, and community tools in one place."
      />

      <div className="space-y-4 text-base/7 text-zinc-700 dark:text-zinc-300">
        <p>
          Use it to learn the game or to look something up mid-hunt, then follow the links out to MHWiki, MHCT, and
          Markethunt when you want more detail.
        </p>
      </div>

      <Subheading className="mt-10">What&apos;s here</Subheading>

      <ul className="mt-3 list-disc space-y-2 pl-5 text-base/7 text-zinc-700 marker:text-zinc-400 dark:text-zinc-300 dark:marker:text-zinc-600">
        {features.map(({ href, name, description }) => (
          <li key={href}>
            <PageLink href={href} className="font-medium">
              {name}
            </PageLink>
            : {description}
          </li>
        ))}
      </ul>

      <Subheading className="mt-10">Get involved</Subheading>

      <p className="mt-3 text-base/7 text-zinc-700 dark:text-zinc-300">
        Come say hi on the <PageLink href="https://discord.gg/mousehunt">MouseHunt Community Discord</PageLink> to ask
        questions, suggest something, or share a tool you&apos;ve made. The code lives on{' '}
        <PageLink href="https://github.com/MHCommunity">GitHub</PageLink>, and pull requests are welcome.
      </p>

      <div className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <Subheading>Disclaimer</Subheading>
        <p className="mt-3 text-sm/6 text-zinc-600 dark:text-zinc-400">
          mouse.rip is a fan-made site created by and for the MouseHunt community. It is not affiliated with, endorsed
          by, or sponsored by HitGrab. All game content and materials belong to{' '}
          <PageLink href="https://hitgrab.com/">HitGrab</PageLink>.
        </p>
      </div>
    </div>
  );
}
