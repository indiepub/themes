import { adminPath, SITE_ORIGIN } from '@indiepub/stator/server/site';
import { defineApiRoute } from '@statorjs/stator/server';

export const GET = defineApiRoute({
  method: 'GET',
  handler: () => `User-agent: *\nAllow: /\nDisallow: ${adminPath()}\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
});
