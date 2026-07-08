import type { MetadataRoute } from 'next';

// Web app manifest — wires the existing icons into an installable PWA shell.
// Next serves this at /manifest.webmanifest and auto-adds the <link rel="manifest">.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'mouse.rip — MouseHunt Resources',
    short_name: 'mouse.rip',
    description:
      'Community-built MouseHunt guides, extensions, tools, spreadsheets, and userscripts.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fcfcfb',
    theme_color: '#fcfcfb',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
