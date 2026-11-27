import { ImageResponse } from 'next/og';

import { STAR } from './star';

// The site-wide 1200×630 social card, served at /og and referenced explicitly
// by every page's metadata (see src/seo.ts). Prerendered at build time.
export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '88px 96px',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fcfcfb 45%, #ecfeff 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontSize: '26px',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#71717a',
        }}
      >
        MouseHunt Resources
      </div>

      {/* The star and the wordmark, side by side as they are in the site's sidebar and on every other card. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginTop: '36px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={STAR} width={136} height={136} alt="" />
        <div style={{ fontSize: '160px', fontWeight: 800, letterSpacing: '-0.04em', color: '#9d174d', lineHeight: 1 }}>
          mouse.rip
        </div>
      </div>

      <div style={{ marginTop: '36px', fontSize: '46px', fontWeight: 600, color: '#18181b' }}>
        MouseHunt guides, tools, and game data.
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
