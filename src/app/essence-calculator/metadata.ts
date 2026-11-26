import { ogCard, pageMetadata } from '@/seo';

export const metadata = pageMetadata({
  title: 'MouseHunt Essence Calculator',
  description: 'Calculate your final essence counts after crafting higher-tier essences in MouseHunt.',
  path: '/essence-calculator',
  image: ogCard({ title: 'Essence calculator', eyebrow: 'MouseHunt tool', icon: 'beaker', accent: 'violet' }),
});
