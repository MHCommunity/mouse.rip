import { ImageResponse } from 'next/og';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  ArrowTrendingUpIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  FireIcon,
  MapIcon,
  MapPinIcon,
  ScaleIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/20/solid';
import type React from 'react';

import { OG_CARD_FIELDS, verifyOgCard, type OgCardAccent, type OgCardIcon } from '@/lib/og-signature';

import { STAR } from '../star';

// Dynamic 1200×630 social card driven by query params, shared by mouse, item,
// group, location, and tool pages (see `ogCard` in src/seo.ts). Rendered on demand — typically
// only when a crawler unfurls a link — so it adds no prebuilt assets. Only links
// the site signed are rendered; any other request is sent to the site-wide card.
export const dynamic = 'force-dynamic';

/** The title's colour, the background's wash, and the tile behind an icon. */
const ACCENTS: Record<OgCardAccent, { strong: string; bg: string; tile: string }> = {
  emerald: { strong: '#047857', bg: '#ecfdf5', tile: '#d1fae5' },
  blue: { strong: '#1d4ed8', bg: '#eff6ff', tile: '#dbeafe' },
  pink: { strong: '#9d174d', bg: '#fdf2f8', tile: '#fce7f3' },
  amber: { strong: '#b45309', bg: '#fffbeb', tile: '#fef3c7' },
  sky: { strong: '#0369a1', bg: '#f0f9ff', tile: '#e0f2fe' },
  violet: { strong: '#6d28d9', bg: '#f5f3ff', tile: '#ede9fe' },
  green: { strong: '#15803d', bg: '#f0fdf4', tile: '#dcfce7' },
  rose: { strong: '#be123c', bg: '#fff1f2', tile: '#ffe4e6' },
  orange: { strong: '#c2410c', bg: '#fff7ed', tile: '#ffedd5' },
};

/** The same icons the tools' page headers use, by the names `ogCard` takes. */
const ICONS: Record<OgCardIcon, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  scale: ScaleIcon,
  trophy: TrophyIcon,
  sparkles: SparklesIcon,
  'map-pin': MapPinIcon,
  building: BuildingOffice2Icon,
  beaker: BeakerIcon,
  fire: FireIcon,
  map: MapIcon,
  'trending-up': ArrowTrendingUpIcon,
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
 * Roughly how wide a title is, in ems of its own font size: enough to tell whether it fits on one line. This is
 * the width before the title's tighter letter spacing, because that is what the renderer wraps on. Checked
 * against rendered cards, the real figure came out a little under this one for every title tried.
 */
function widthInEms(text: string): number {
  let ems = 0;
  for (const char of text) {
    if (/[\silI1.,'|!:;]/.test(char)) ems += 0.27;
    else if (/[rtfj]/.test(char)) ems += 0.38;
    else if (/[mwMW]/.test(char)) ems += 0.85;
    else if (/[A-Z0-9+&]/.test(char)) ems += 0.68;
    else ems += 0.55;
  }
  return ems;
}

/** The side of the square picture or icon tile beside the text, and the gap between the two. */
const ART = 320;
const ART_GAP = 48;

/** The room for text beside the art: the card less its padding, the art and the gap. */
const WIDTH_BESIDE_ART = 1200 - 96 * 2 - ART - ART_GAP;

/**
 * The title's size. A card with a strip across the top has less height, so a long name steps down sooner there.
 * One with a picture or an icon beside the text has less width, so a short name ("Relic Hunter") shrinks just
 * enough to stay on one line, and a name too long for that wraps instead.
 */
function titleSize(title: string, { strip, beside }: { strip: boolean; beside: boolean }): number {
  if (strip) return title.length > 22 ? 64 : 84;
  if (beside) {
    // A little under the full width, since the estimate is rough. A name that won't fit even at 64px wraps.
    const room = WIDTH_BESIDE_ART * 0.98;
    return [104, 100, 96, 92, 88, 84, 80, 76, 72, 68, 64].find((size) => widthInEms(title) * size <= room) ?? 76;
  }
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
  // hasOwn, so "constructor" and the like fall back instead of reading off Object.prototype.
  const requestedIcon = searchParams.get('icon') ?? '';
  const icon = Object.hasOwn(ICONS, requestedIcon) ? (requestedIcon as OgCardIcon) : '';
  const requested = searchParams.get('accent') ?? '';
  const accentName = Object.hasOwn(ACCENTS, requested) ? (requested as OgCardAccent) : 'pink';
  const accent = ACCENTS[accentName];

  // Key on the params we actually use, so junk or reordered params share an entry.
  const cacheKey = new URL('/og/card', url.origin);
  for (const [key, value] of Object.entries({ title, subtitle, eyebrow, image, banner, icon, accent: accentName })) {
    cacheKey.searchParams.set(key, value);
  }
  const cache = edgeCache();
  const cached = await cache?.match(cacheKey);
  if (cached) return cached;

  const response = renderCard({ title, subtitle, eyebrow, image, banner, icon, accent });
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
  icon,
  accent,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  image: string;
  banner: string;
  icon: OgCardIcon | '';
  accent: (typeof ACCENTS)[OgCardAccent];
}) {
  const strip = bannerLayout(banner);
  const Icon = icon ? ICONS[icon] : undefined;
  const fontSize = titleSize(title, { strip: Boolean(strip), beside: Boolean(image || Icon) });

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
          gap: `${ART_GAP}px`,
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
            width={ART}
            height={ART}
            style={{
              width: `${ART}px`,
              height: `${ART}px`,
              objectFit: 'contain',
              borderRadius: '32px',
            }}
            alt=""
          />
        )}

        {Icon && !image && (
          // The page header's icon tile, at the size the pictures get.
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: `${ART}px`,
              height: `${ART}px`,
              borderRadius: '32px',
              background: accent.tile,
            }}
          >
            <Icon width={184} height={184} fill={accent.strong} color={accent.strong} />
          </div>
        )}
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
