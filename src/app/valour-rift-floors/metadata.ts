import { ogCard, pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'Valour Rift Floor Order',
  description:
    'See which Valour Rift tower floors are coming up next. Enter your current floor to reorder the floor-type list and plan your run.',
  path: '/valour-rift-floors',
  image: ogCard({ title: 'Valour Rift floors', eyebrow: 'MouseHunt tool', icon: 'building', accent: 'sky' }),
});
