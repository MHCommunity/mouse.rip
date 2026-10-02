import { ImageResponse } from 'next/og';

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
        justifyContent: 'space-between',
        padding: '88px 96px',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fcfcfb 45%, #ecfeff 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '9999px', background: '#db2777' }} />
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
      </div>

      {/* Wordmark + tagline */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '160px', fontWeight: 800, letterSpacing: '-0.04em', color: '#9d174d', lineHeight: 1 }}>
          mouse.rip
        </div>
        <div style={{ marginTop: '28px', fontSize: '46px', fontWeight: 600, color: '#18181b' }}>
          Guides, tools, and resources to hunt smarter.
        </div>
      </div>

      {/* Footer categories */}
      <div style={{ display: 'flex', gap: '18px', fontSize: '28px', fontWeight: 500, color: '#a1a1aa' }}>
        <span style={{ color: '#be185d' }}>Guides</span>
        <span>·</span>
        <span style={{ color: '#0e7490' }}>Extensions</span>
        <span>·</span>
        <span style={{ color: '#15803d' }}>Tools</span>
        <span>·</span>
        <span style={{ color: '#1d4ed8' }}>Spreadsheets</span>
        <span>·</span>
        <span style={{ color: '#7e22ce' }}>Userscripts</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
