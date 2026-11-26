import { ImageResponse } from 'next/og';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { OG_CARD_FIELDS, verifyOgCard } from '@/lib/og-signature';

import { STAR } from '../star';

// Dynamic 1200×630 social card driven by query params, shared by mouse, item,
// and group pages (see `ogCard` in src/seo.ts). Rendered on demand — typically
// only when a crawler unfurls a link — so it adds no prebuilt assets. Only links
// the site signed are rendered; any other request is sent to the site-wide card.
export const dynamic = 'force-dynamic';

const ACCENTS: Record<string, { strong: string; bg: string }> = {
  emerald: { strong: '#047857', bg: '#ecfdf5' },
  blue: { strong: '#1d4ed8', bg: '#eff6ff' },
  pink: { strong: '#9d174d', bg: '#fdf2f8' },
};

// ImageResponse fetches `image` server-side from the worker, so an unrestricted
// param would make this route an open image proxy pointed at any host on the
// internet. Our own pages only ever pass art from the image CDN, so that's all that gets through.
const IMAGE_HOST = 'i.mouse.rip';
const IMAGE_PATH = '/images/';

// The game's wide art that can run across the top of a card, by where it lives on the image host. `crop` is the
// part of the picture to show, scaled to the card's width; both come out 178px tall.
const BANNERS = [
  {
    // A location's 760×127 header has a MouseHunt logo on its left and a wooden frame along its bottom and right,
    // the same on every location. This is the widest strip of it that's all scenery.
    path: '/images/locations/headers/',
    source: { width: 760, height: 127 },
    crop: { left: 230, top: 0, width: 470, height: 70 },
  },
  {
    // A mouse group's 600×124 banner is all art, so it's only trimmed top and bottom, around the mice's faces.
    path: '/images/mice/groups/',
    source: { width: 600, height: 124 },
    crop: { left: 0, top: 12, width: 600, height: 89 },
  },
];

/** Where to put a banner's picture so its crop fills a strip across the card, or undefined if it isn't one we know. */
function bannerLayout(banner: string) {
  const kind = banner ? BANNERS.find(({ path }) => new URL(banner).pathname.startsWith(path)) : undefined;
  if (!kind) return undefined;
  const scale = 1200 / kind.crop.width;
  return {
    stripHeight: Math.floor(kind.crop.height * scale),
    left: -Math.round(kind.crop.left * scale),
    top: -Math.round(kind.crop.top * scale),
    width: Math.round(kind.source.width * scale),
    height: Math.round(kind.source.height * scale),
  };
}

/**
 * The title's size. A card with a strip across the top has less height, and one with a picture beside
 * the text has less width, so a long name steps down sooner on those.
 */
function titleSize(title: string, { strip, beside }: { strip: boolean; beside: boolean }): number {
  if (strip) return title.length > 22 ? 64 : 84;
  if (beside) return title.length > 16 ? 76 : 104;
  return title.length > 28 ? 76 : 104;
}

function safeImage(value: string | null): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    const ours = url.protocol === 'https:' && url.host === IMAGE_HOST && url.pathname.startsWith(IMAGE_PATH);
    // Without the query string: it isn't needed, and it would let one image be asked for under endless URLs.
    return ours ? `${url.origin}${url.pathname}` : '';
  } catch {
    return '';
  }
}

// Rendering a card costs real worker CPU, so finished cards go in the
// Cloudflare edge cache. Not available under `next dev`.
function edgeCache(): Cache | undefined {
  return typeof caches === 'undefined' ? undefined : (caches as unknown as { default?: Cache }).default;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;

  // Checked against the params exactly as they arrived, before any defaults or trimming.
  const asSent = Object.fromEntries(OG_CARD_FIELDS.map((field) => [field, searchParams.get(field)]));
  if (!verifyOgCard(asSent, searchParams.get('sig'))) {
    // A link shared before cards were signed still gets a picture, just not one with its own words on it.
    return new Response(null, { status: 302, headers: { Location: '/og' } });
  }

  const title = (searchParams.get('title') || 'mouse.rip').slice(0, 90);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 120);
  const eyebrow = (searchParams.get('eyebrow') || 'mouse.rip').slice(0, 60);
  const image = safeImage(searchParams.get('image'));
  const banner = safeImage(searchParams.get('banner'));
  // hasOwn, so "constructor" and the like fall back to pink instead of reading off Object.prototype.
  const requested = searchParams.get('accent') ?? '';
  const accentName = Object.hasOwn(ACCENTS, requested) ? requested : 'pink';
  const accent = ACCENTS[accentName];

  // Key on the params we actually use, so junk or reordered params share an entry.
  const cacheKey = new URL('/og/card', url.origin);
  for (const [key, value] of Object.entries({ title, subtitle, eyebrow, image, banner, accent: accentName })) {
    cacheKey.searchParams.set(key, value);
  }
  const cache = edgeCache();
  const cached = await cache?.match(cacheKey);
  if (cached) return cached;

  const response = renderCard({ title, subtitle, eyebrow, image, banner, accent });
  response.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  if (cache) {
    getCloudflareContext().ctx.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}

function renderCard({
  title,
  subtitle,
  eyebrow,
  image,
  banner,
  accent,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  image: string;
  banner: string;
  accent: (typeof ACCENTS)[string];
}) {
  const strip = bannerLayout(banner);
  const fontSize = titleSize(title, { strip: Boolean(strip), beside: Boolean(image) });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${accent.bg} 0%, #fcfcfb 60%)`,
        fontFamily: 'sans-serif',
      }}
    >
      {strip && (
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: '1200px',
            height: `${strip.stripHeight}px`,
            overflow: 'hidden',
          }}
        >
          {/* The whole picture, scaled and slid so only its crop is inside the strip. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner}
            width={strip.width}
            height={strip.height}
            style={{
              position: 'absolute',
              top: `${strip.top}px`,
              left: `${strip.left}px`,
              width: `${strip.width}px`,
              height: `${strip.height}px`,
            }}
            alt=""
          />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '64px',
          flex: 1,
          padding: strip ? '44px 96px 52px' : '88px 96px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#71717a',
            }}
          >
            {eyebrow}
          </div>

          <div
            style={{
              marginTop: strip ? '20px' : '28px',
              fontSize: `${fontSize}px`,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              color: accent.strong,
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div style={{ marginTop: strip ? '16px' : '24px', fontSize: '40px', fontWeight: 500, color: '#3f3f46' }}>
              {subtitle}
            </div>
          )}

          {/* The star and the wordmark, as in the site's sidebar and on the site-wide card. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: 'auto',
              paddingTop: strip ? '28px' : '40px',
              fontSize: '30px',
              fontWeight: 700,
              color: '#a1a1aa',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={STAR} width={40} height={40} alt="" />
            mouse.rip
          </div>
        </div>

        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            width={360}
            height={360}
            style={{
              width: '360px',
              height: '360px',
              objectFit: 'contain',
              borderRadius: '32px',
            }}
            alt=""
          />
        )}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
