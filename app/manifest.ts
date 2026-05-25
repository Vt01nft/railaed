import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RailAED · UAE → Anywhere · USDC on Arc',
    short_name: 'RailAED',
    description:
      'Pay in AED, settle in USDC on Arc, deliver to any corridor in seconds. Live honesty score on every quote.',
    start_url: '/',
    display: 'standalone',
    background_color: '#082822',
    theme_color: '#082822',
    orientation: 'portrait-primary',
    categories: ['finance', 'productivity'],
    lang: 'en-AE',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
    ],
  };
}
