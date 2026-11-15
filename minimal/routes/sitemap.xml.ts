import { contentRevision, listEntries, topTags } from '@indiepub/stator/server/entries';
import { SITE_ORIGIN } from '@indiepub/stator/server/site';
import { defineApiRoute } from '@statorjs/stator/server';

const SECTIONS = ['', '/notes', '/articles', '/archive', '/about', '/subscribe'];

export const GET = defineApiRoute({
  method: 'GET',
  revision: contentRevision,
  handler: () => {
    const urls = [
      ...SECTIONS.map((p) => `${SITE_ORIGIN}${p}`),
      ...listEntries({ limit: 10_000 }).map((e) => `${SITE_ORIGIN}/${e.slug}`),
      ...topTags(1000).map((t) => `${SITE_ORIGIN}/tags/${t.slug}`),
    ];
    const body = urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  },
});
