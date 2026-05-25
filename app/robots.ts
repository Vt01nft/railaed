import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/claim/'],
      },
    ],
    sitemap: 'https://railaed-uae.vercel.app/sitemap.xml',
    host: 'https://railaed-uae.vercel.app',
  };
}
