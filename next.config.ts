import type { NextConfig } from 'next';

/**
 * What the pages load today, written down as a policy.
 *
 * Sent as Report-Only for now: the browser logs anything that would break it without blocking, so it can be
 * checked on the live site (Cloudflare can add scripts of its own) before it's enforced. 'unsafe-inline' stays
 * because prerendered pages carry inline bootstrap scripts, which rules out per-request nonces.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://i.mouse.rip",
  "font-src 'self'",
  "connect-src 'self' https://api.mouse.rip https://api.markethunt.win",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig: NextConfig = {
  // Nobody needs to be told which framework this is.
  poweredByHeader: false,
  async redirects() {
    return [
      // A short link hunters pass around. It used to live in a Cloudflare Pages _redirects file, which Workers
      // doesn't read.
      { source: '/cre', destination: '/catch-rate-estimator', permanent: true },
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
          // The site already redirects http to https; this tells browsers to skip the http request next time.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          // The site uses none of these, so nothing embedded in it can ask for them either.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          // `next dev` needs eval for hot reloading, which would fill the console with reports.
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Content-Security-Policy-Report-Only', value: CONTENT_SECURITY_POLICY }]
            : []),
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
