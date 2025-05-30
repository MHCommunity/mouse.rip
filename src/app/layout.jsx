import '@/styles/tailwind.css';

import { ApplicationLayout } from './application-layout';
import { getItems } from '@/data';

export const metadata = {
  title: {
    template: '%s | mouse.rip',
    default: 'MouseHunt Resources & Tools | mouse.rip',
  },
  description: 'Your comprehensive resource for MouseHunt guides, browser extensions, tools, spreadsheets, and userscripts to enhance your MouseHunt experience.',
};

export default async function RootLayout({ children }) {
  const items = await getItems();

  return (
    <html
      lang="en"
      className="antialiased bg-white text-zinc-950 dark:text-zinc-50 dark:bg-zinc-900 transition-colors duration-300"
    >
      <body className="flex flex-col min-h-screen">
        <ApplicationLayout events={items}>{children}</ApplicationLayout>
      </body>
    </html>
  );
}
