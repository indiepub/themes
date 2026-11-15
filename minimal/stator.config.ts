import { defineConfig } from '@statorjs/stator';
import { sessionStore } from '@statorjs/stator/server';

export default defineConfig({
  // Unset REDIS_URL keeps sessions in memory, so a restart signs everyone out.
  persistence: { session: sessionStore({ redisUrl: process.env.REDIS_URL }) },
  sessions: { ttlSeconds: 7 * 24 * 60 * 60 },
  images: {
    dir: process.env.SITE_MEDIA ?? 'media',
    // Must equal SITE_MEDIA_PATH.
    path: '/media',
    widths: [192, 400, 800, 1200, 1600],
  },
});
