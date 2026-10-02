import { ImageResponse } from 'next/og';

// Dynamic 1200×630 social card driven by query params, shared by mouse, item,
// and group pages (see `ogCard` in src/seo.ts). Rendered on demand — typically
// only when a crawler unfurls a link — so it adds no prebuilt assets.
export const dynamic = 'force-dynamic';

const ACCENTS: Record<string, { strong: string; soft: string; bg: string }> = {
  emerald: { strong: '#047857', soft: '#10b981', bg: '#ecfdf5' },
  blue: { strong: '#1d4ed8', soft: '#3b82f6', bg: '#eff6ff' },
  pink: { strong: '#9d174d', soft: '#db2777', bg: '#fdf2f8' },
};

// ImageResponse fetches `image` server-side from the worker, so an unrestricted
// param would make this route an open image proxy pointed at any host on the
// internet. Only the two hosts our own pages actually pass are allowed through.
const IMAGE_HOSTS = new Set(['i.mouse.rip', 'www.mousehuntgame.com']);

function safeImage(value: string | null): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && IMAGE_HOSTS.has(url.host) ? url.href : '';
  } catch {
    return '';
  }
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get('title') || 'mouse.rip').slice(0, 90);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 120);
  const eyebrow = (searchParams.get('eyebrow') || 'mouse.rip').slice(0, 60);
  const image = safeImage(searchParams.get('image'));
  const accent = ACCENTS[searchParams.get('accent') || 'pink'] ?? ACCENTS.pink;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '64px',
        padding: '88px 96px',
        background: `linear-gradient(135deg, ${accent.bg} 0%, #fcfcfb 60%)`,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '9999px', background: accent.soft }} />
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
        </div>

        <div
          style={{
            marginTop: '28px',
            fontSize: title.length > 28 ? '76px' : '104px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.02,
            color: accent.strong,
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div style={{ marginTop: '24px', fontSize: '40px', fontWeight: 500, color: '#3f3f46' }}>{subtitle}</div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '40px', fontSize: '30px', fontWeight: 700, color: '#a1a1aa' }}>
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
    </div>,
    { width: 1200, height: 630 },
  );
}
