import { defineApiRoute } from '@statorjs/stator/server';

export const GET = defineApiRoute({
  method: 'GET',
  handler: (request) =>
    new Response(null, { status: 301, headers: { Location: `/${String(request.params.slug)}` } }),
});
