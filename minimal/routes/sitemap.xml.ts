import { sitemapResponse } from '@indiepub/stator/server/sitemap';
import { defineApiRoute } from '@statorjs/stator/server';

export const GET = defineApiRoute({
  method: 'GET',
  handler: (request) => sitemapResponse(['', '/notes', '/articles', '/archive', '/about', '/subscribe'], request),
});
