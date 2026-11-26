import { ogCard, pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Queso Pump Calculator',
  description:
    "Work out the most time-efficient Queso cheese strategy for pumping the volcano in Queso Canyon. Compares Bland through Flamin' Queso by total hunts and Bland Queso required.",
  path: '/queso-pump-calculator',
  image: ogCard({ title: 'Queso pump calculator', eyebrow: 'MouseHunt tool', icon: 'fire', accent: 'orange' }),
});
