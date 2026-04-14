import { createDb } from '@indiepub/astro/lib/db';
import { getEnv } from '@indiepub/astro/lib/env';
import type { D1Database } from '@cloudflare/workers-types';

export function getDb(indiepub: { config: { d1BindingName?: string } }) {
  const d1BindingName = indiepub.config.d1BindingName ?? 'DB';
  const d1 = getEnv()[d1BindingName] as D1Database;
  return createDb(d1);
}
