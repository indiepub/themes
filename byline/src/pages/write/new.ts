import type { APIRoute } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';
import { createMutationsApi } from '@indiepub/astro/lib/mutations';
import { getEnv } from '@indiepub/astro/lib/env';

export const POST: APIRoute = async ({ locals, request, redirect }) => {
  if (!locals.isAdmin) return redirect('/', 302);

  const indiepub = locals.indiepub;
  if (!indiepub) return new Response('Service unavailable', { status: 503 });

  const cfg = indiepub.config;
  const d1BindingName = cfg.d1BindingName ?? 'DB';
  const d1 = getEnv()[d1BindingName] as D1Database;
  const siteUrl = cfg.siteUrl ?? new URL(request.url).origin;

  const form = await request.formData();
  const entryType = form.get('type') === 'article' ? ('article' as const) : ('note' as const);

  const mutations = createMutationsApi(d1, siteUrl);
  const entry = await mutations.createEntry({ type: entryType, status: 'draft' });
  return redirect(`/write/${entryType}/${entry.id}`, 302);
};
