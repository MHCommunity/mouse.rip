import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Prices are on each item's page now.
      { source: '/marketplace', destination: '/items?tradable=1', permanent: true },
      // Retired userscripts that a listed one replaces.
      {
        source: '/userscripts/minluck-and-catch-rate-estimate',
        destination: '/userscripts/minluck-and-cre-tool',
        permanent: true,
      },
      {
        source: '/userscripts/449489-mousehunt-better-gifts-gift-buttons',
        destination: '/userscripts/gifting-buttons',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'preview.mouse.rip',
          },
        ],
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive',
          },
        ],
      },
    ];
  },
  images: {
    // Images come straight from the i.mouse.rip CDN at their final size.
    // Optimizing them would route every image through the worker.
    unoptimized: true,
    remotePatterns: [new URL('https://i.mouse.rip/**')],
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
