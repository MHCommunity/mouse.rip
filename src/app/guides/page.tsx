import { AcademicCapIcon } from '@heroicons/react/20/solid';
import { PageHeader } from '@/components/page-header';
import { ItemList } from '@/components/item-list';
import { SectionHeading } from '@/components/section-heading';
import { ToolCard, type Tint } from '@/components/tool-card';

import React from 'react';

import { itemImageUrl, titleImageUrl } from '@/lib/image-urls';
import { getResourcesByCategory } from '@/lib/site-data';
import { pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Guides',
  description:
    'MouseHunt strategy and how-to guides written by other hunters, covering traps, locations, and rank progression.',
  path: '/guides',
});

/** mouse.rip's own reference pages: game facts rather than strategy, kept here instead of in the sidebar. */
const reference: { href: string; name: string; description: string; image: string; tint: Tint }[] = [
  {
    href: '/titles',
    name: 'Titles and ranks',
    description: 'Every hunter rank from Novice to Fabled, and what each one needs.',
    image: titleImageUrl('fabled'),
    tint: 'pink',
  },
  {
    href: '/trap-special-effects',
    name: 'Trap and base special effects',
    description: 'Traps and bases that behave differently in specific locations.',
    image: itemImageUrl('chrome_acronym_weapon'),
    tint: 'sky',
  },
];

export default async function Guides() {
  const items = await getResourcesByCategory('guide');

  return (
    <>
      <PageHeader
        title="MouseHunt guides"
        description="Strategy and how-tos written by other hunters."
        count={items.length}
        countLabel="guides"
        icon={AcademicCapIcon}
        iconClassName="bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
      />
      <section aria-labelledby="guides-heading" className="mt-10">
        <SectionHeading id="guides-heading">Guides</SectionHeading>
        <ItemList items={items} headingLevel={3} showCategory={false} compact />
      </section>

      {/* The site's own reference pages come after the guides, which are what most visitors came for. */}
      <section aria-labelledby="reference-heading" className="mt-10">
        <SectionHeading id="reference-heading">Game reference</SectionHeading>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {reference.map(({ href, name, description, image, tint }) => (
            <li key={href}>
              <ToolCard href={href} title={name} description={description} image={image} tint={tint} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
