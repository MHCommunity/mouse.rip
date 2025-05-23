import '@/styles/tailwind.css';

import { ApplicationLayout } from './application-layout';
import { getItems } from '@/data';

export const metadata = {
  title: {
    template: '%s | mouse.rip',
    default: 'mouse.rip',
  },
  description: '',
};

export default async function RootLayout({ children }) {
  const items = await getItems();

  return (
    <html
      lang="en"
      className="antialiased text-zinc-950 bg-gradient-to-br from-sky-50 to-sky-400 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950"
    >
      <body className="min-h-screen flex flex-col">
        <ApplicationLayout events={items}>{children}</ApplicationLayout>
      </body>
    </html>
  );
}
