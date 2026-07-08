import type { Metadata } from 'next';

const SITE_NAME = 'mouse.rip';
const OG_IMAGE = {
  url: '/og',
  width: 1200,
  height: 630,
  alt: 'mouse.rip — MouseHunt guides, tools, and resources',
};

type PageMetadataOptions = {
  /** Bare page title; the root template appends " | mouse.rip" for the <title>. */
  title: string;
  description: string;
  /** Absolute path for canonical + og:url, e.g. `/guides`. Resolved against metadataBase. */
  path: string;
  /** Open Graph type. Use `article` for guides/long-form content. */
  type?: 'website' | 'article';
  /** Override the social card image URL (e.g. a per-entity `/og/card?...`). */
  image?: string;
};

/** Build a dynamic social-card URL for the shared `/og/card` route. */
export function ogCard(params: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: string;
  accent?: string;
}): string {
  const search = new URLSearchParams();
  search.set('title', params.title);
  if (params.subtitle) search.set('subtitle', params.subtitle);
  if (params.eyebrow) search.set('eyebrow', params.eyebrow);
  if (params.image) search.set('image', params.image);
  if (params.accent) search.set('accent', params.accent);
  return `/og/card?${search.toString()}`;
}

/**
 * Builds a complete, consistent metadata object for a page: title, description,
 * a self-referencing canonical URL, and fully-populated Open Graph + Twitter
 * cards. Next.js replaces (does not deep-merge) the `openGraph`/`twitter`
 * objects from the root layout, so they must be defined in full here.
 */
export function pageMetadata({ title, description, path, type = 'website', image }: PageMetadataOptions): Metadata {
  const ogTitle = `${title} | ${SITE_NAME}`;
  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: ogTitle }]
    : [OG_IMAGE];

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: 'en_US',
      title: ogTitle,
      description,
      url: path,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [images[0].url],
    },
  };
}
