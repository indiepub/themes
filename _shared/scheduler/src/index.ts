/**
 * IndiePub Scheduler — Cloudflare Worker with cron trigger.
 *
 * Runs on a schedule to sync social interactions (likes, reposts, replies)
 * from Bluesky and Mastodon back into the site's interactions table.
 */

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@indiepub/db/schema';
import { syncAllPendingInteractions } from '@indiepub/astro/db/backfeed-sync';

interface Env {
  DB: D1Database;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const db = drizzle(env.DB, { schema });
    const processed = await syncAllPendingInteractions(db);
    console.log(`[scheduler] Synced interactions for ${processed} entries`);
  },

  async fetch(_request: Request, _env: Env): Promise<Response> {
    return new Response('IndiePub Scheduler — use cron triggers', { status: 200 });
  },
};
