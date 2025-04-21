import { getItems } from '@/data';
import '@/styles/tailwind.css';

import { ApplicationLayout } from './application-layout';

export const metadata = {
  title: {
    template: '%s - mouse.rip',
    default: 'mouse.rip',
  },
  description: '',
};

export default async function RootLayout({ children }) {
  const items = await getItems();

  return (
    <html
      lang="en"
      className="text-zinc-950 antialiased lg:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:lg:bg-zinc-950"
    >
      <body>
        <ApplicationLayout events={ items }>{ children }</ApplicationLayout>
	</body>
	</html>
  );
}
