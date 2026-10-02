import React, { type ReactNode } from 'react';

import { Geist, Geist_Mono } from 'next/font/google';

import { ViewTransitions } from 'next-view-transitions';

import { ApplicationLayout } from './application-layout';

import './styles.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

import type { Metadata, Viewport } from 'next';

const SITE_DESCRIPTION =
  'Your comprehensive resource for MouseHunt guides, browser extensions, tools, spreadsheets, and userscripts to enhance your MouseHunt experience.';

export const metadata: Metadata = {
  metadataBase: new URL('https://mouse.rip'),
  title: {
    template: '%s | mouse.rip',
    default: 'MouseHunt Resources & Tools | mouse.rip',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'mouse.rip',
  keywords: [
    'MouseHunt',
    'MouseHunt guides',
    'MouseHunt tools',
    'MouseHunt calculators',
    'MouseHunt extensions',
    'MouseHunt userscripts',
    'MouseHunt spreadsheets',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'mouse.rip',
    title: 'MouseHunt Resources & Tools | mouse.rip',
    description: SITE_DESCRIPTION,
    url: 'https://mouse.rip',
    locale: 'en_US',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'mouse.rip — MouseHunt guides, tools, and resources' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MouseHunt Resources & Tools | mouse.rip',
    description: SITE_DESCRIPTION,
    images: ['/og'],
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfb' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth bg-white text-zinc-950 antialiased transition-colors duration-300 dark:bg-zinc-900 dark:text-zinc-50`}
    >
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-pink-700 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:bg-zinc-900 dark:focus:text-pink-300"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'mouse.rip',
              url: 'https://mouse.rip',
              description: SITE_DESCRIPTION,
              publisher: {
                '@type': 'Organization',
                name: 'mouse.rip',
                url: 'https://mouse.rip',
                sameAs: ['https://discord.gg/mousehunt', 'https://github.com/MHCommunity'],
              },
              // Makes us eligible for a search box in our own Google result, so
              // people can jump straight to a mouse or item from the SERP.
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://mouse.rip/items?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <ViewTransitions>
          <ApplicationLayout>{children}</ApplicationLayout>
        </ViewTransitions>
      </body>
    </html>
  );
}
