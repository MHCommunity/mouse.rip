import { notFound } from 'next/navigation';
import { AcademicCapIcon } from '@heroicons/react/20/solid';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';
import { Markdown } from '@/components/markdown';
import { PageLink } from '@/components/page-link';

import { getGuide, getOnSiteGuides } from '@/data';
import { pageMetadata } from '@/seo';
import { getGuideBody } from './guide-content';

// Only build the guides we know about; unknown slugs 404 instead of trying to
// render on the edge (where the filesystem isn't available).
export const dynamicParams = false;

export function generateStaticParams() {
  return getOnSiteGuides().map((guide) => ({
    slug: guide.url.replace('/guides/', ''),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    return { title: 'Not Found' };
  }

  return pageMetadata({
    title: `${guide.name} — MouseHunt Guide`,
    description: guide.description,
    path: guide.url,
    type: 'article',
  });
}

export default async function Guide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  const body = getGuideBody(slug);

  if (!guide || !body) {
    notFound();
  }

  const url = `https://mouse.rip${guide.url}`;

  return (
    // Guides are long-form prose, so they keep a readable measure inside the
    // layout's wider content column.
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.name,
            description: guide.description,
            url,
            mainEntityOfPage: url,
            about: 'MouseHunt',
            isPartOf: { '@type': 'WebSite', name: 'mouse.rip', url: 'https://mouse.rip' },
          }),
        }}
      />
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Guides', href: '/guides' }, { name: guide.name }]} />
      <PageHeader
        title={guide.name}
        description={guide.description}
        icon={AcademicCapIcon}
        iconClassName="bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
      />

      <article>
        <Markdown>{body}</Markdown>
      </article>

      {guide.sourceUrl && (
        <footer className="mt-12 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Originally published at <PageLink href={guide.sourceUrl}>{guide.sourceUrl}</PageLink>. Reproduced here for
          easier reading.
        </footer>
      )}
    </div>
  );
}
