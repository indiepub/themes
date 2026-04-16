import type { APIRoute } from 'astro';
import type { D1Database } from '@cloudflare/workers-types';
import { createMutationsApi } from '@indiepub/astro/lib/mutations';
import { getEnv } from '@indiepub/astro/lib/env';

async function createDraftAndRedirect(locals: App.Locals, request: Request, redirect: Function, type?: string | null) {
  if (!locals.isAdmin) return redirect('/', 302);

  const indiepub = locals.indiepub;
  if (!indiepub) return new Response('Service unavailable', { status: 503 });

  const cfg = indiepub.config;
  const d1BindingName = cfg.d1BindingName ?? 'DB';
  const d1 = getEnv()[d1BindingName] as D1Database;
  const siteUrl = cfg.siteUrl ?? new URL(request.url).origin;

  const entryType = type === 'article' ? ('article' as const) : ('note' as const);

  const mutations = createMutationsApi(d1, siteUrl);
  const entry = await mutations.createEntry({ type: entryType, status: 'draft' });
  return redirect(`/write/${entryType}/${entry.id}`, 302);
}

/** GET /write/new?type=note|article — used by command palette */
export const GET: APIRoute = async ({ locals, request, redirect, url }) => {
  const type = url.searchParams.get('type');
  return createDraftAndRedirect(locals, request, redirect, type);
};

/** POST /write/new — used by the writer dashboard form */
export const POST: APIRoute = async ({ locals, request, redirect }) => {
  const form = await request.formData();
  const type = form.get('type') as string | null;
  return createDraftAndRedirect(locals, request, redirect, type);
};
