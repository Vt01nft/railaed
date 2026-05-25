import type { MetadataRoute } from 'next';

const BASE = 'https://railaed-uae.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/send`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/payroll`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];
}
