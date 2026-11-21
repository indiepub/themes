import { sitemapResponse } from '@indiepub/stator/server/sitemap';
import { defineApiRoute } from '@statorjs/stator/server';

const SECTIONS = ['', '/now', '/notes', '/articles', '/photos', '/bookmarks', '/about', '/subscribe'];

export const GET = defineApiRoute({
  method: 'GET',
  handler: (request) => sitemapResponse(SECTIONS, request),
});
