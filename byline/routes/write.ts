import { adminPath } from '@indiepub/stator/server/site';
import { defineApiRoute } from '@statorjs/stator/server';

export const GET = defineApiRoute({
  method: 'GET',
  handler: () => new Response(null, { status: 302, headers: { Location: adminPath() } }),
});
