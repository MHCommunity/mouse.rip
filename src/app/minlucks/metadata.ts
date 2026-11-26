import { ogCard, pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Minluck Search',
  description:
    'Search minluck values for every mouse in MouseHunt to find the lowest luck needed to reliably catch them with each power type.',
  path: '/minlucks',
  image: ogCard({ title: 'Minlucks', eyebrow: 'MouseHunt tool', icon: 'sparkles', accent: 'green' }),
});
