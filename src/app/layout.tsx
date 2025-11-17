import React, { type ReactNode } from 'react';

import { ApplicationLayout } from './application-layout';

import './styles.css';

export const metadata = {
  title: {
    template: '%s | mouse.rip',
    default: 'MouseHunt Resources & Tools | mouse.rip',
  },
  description: 'Your comprehensive resource for MouseHunt guides, browser extensions, tools, spreadsheets, and userscripts to enhance your MouseHunt experience.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className="bg-white text-zinc-950 antialiased transition-colors duration-300 dark:bg-zinc-900 dark:text-zinc-50"
    >
      <body className="flex min-h-screen flex-col">
        <ApplicationLayout>
          {children}
          </ApplicationLayout>
      </body>
    </html>
  );
}
