import { notFound } from 'next/navigation';
import { AcademicCapIcon } from '@heroicons/react/20/solid';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageHeader } from '@/components/page-header';
import { Markdown, headingId } from '@/components/markdown';
import { PageLink } from '@/components/page-link';

import { getGuide, getOnSiteGuides } from '@/lib/site-data';
import { pageMetadata } from '@/seo';
import { getGuideBody, guideSections } from './guide-content';
import { scriptJson } from '@/components/json-ld';

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
    title: `${guide.name}: MouseHunt Guide`,
    description: guide.description,
    path: guide.url,
    type: 'article',
  });
}

/** Where a guide first appeared, by name rather than as a long raw link. */
function sourceName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const names: Record<string, string> = {
      'docs.google.com': 'Google Docs',
      'reddit.com': 'Reddit',
      'old.reddit.com': 'Reddit',
      'mhwiki.hitgrab.com': 'MHWiki',
      'pastebin.com': 'Pastebin',
    };
    return names[host] ?? host;
  } catch {
    return url;
  }
}

export default async function Guide({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  const body = getGuideBody(slug);

  if (!guide || !body) {
    notFound();
  }

  const url = `https://mouse.rip${guide.url}`;
  const sections = guideSections(body, headingId);

  return (
    // Guides are long-form prose, so they keep a readable measure inside the
    // layout's wider content column.
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: scriptJson({
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

      {sections.length > 0 && (
        <nav
          aria-labelledby="contents-heading"
          className="mb-8 rounded-2xl bg-white p-4 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <h2 id="contents-heading" className="text-sm font-semibold text-zinc-900 dark:text-white">
            Contents
          </h2>
          <ol className="mt-2 gap-x-6 space-y-1 text-sm sm:columns-2">
            {sections.map((section) => (
              <li key={section.id} className="break-inside-avoid">
                <a
                  href={`#${section.id}`}
                  className="text-pink-700 underline decoration-pink-700/30 underline-offset-2 hover:text-pink-900 hover:decoration-current dark:text-pink-300 dark:decoration-pink-300/40 dark:hover:text-pink-200"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <article>
        <Markdown>{body}</Markdown>
      </article>

      {guide.sourceUrl && (
        <footer className="mt-12 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          First published on <PageLink href={guide.sourceUrl}>{sourceName(guide.sourceUrl)}</PageLink>.
        </footer>
      )}
    </div>
  );
}
