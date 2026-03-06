import type { APIRoute } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';
import { createMutationsApi } from '@indiepub/astro/lib/mutations';

export const POST: APIRoute = async ({ locals, request, redirect }) => {
  if (!locals.isAdmin) return redirect('/', 302);

  const indiepub = locals.indiepub;
  if (!indiepub) return new Response('Service unavailable', { status: 503 });

  const cfg = indiepub.config;
  const d1BindingName = cfg.d1BindingName ?? 'DB';
  const runtime = (locals as unknown as Record<string, unknown>)['runtime'] as
    | { env: Record<string, unknown> }
    | undefined;
  const d1 = runtime?.env?.[d1BindingName] as D1Database;
  const siteUrl = cfg.siteUrl ?? new URL(request.url).origin;

  const form = await request.formData();
  const entryType = form.get('type') === 'article' ? ('article' as const) : ('note' as const);

  const mutations = createMutationsApi(d1, siteUrl);
  const entry = await mutations.createEntry({ type: entryType, status: 'draft' });
  return redirect(`/write/${entry.id}`, 302);
};
