import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { indiepub } from '@indiepub/astro';
import { indiepubAdmin } from '@indiepub/admin';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'cloudflare',
  }),
  session: { driver: 'unstorage/drivers/null' },
  vite: {
    environments: {
      ssr: {
        external: ['node:fs/promises', 'node:path', 'node:url', 'node:crypto'],
      },
    },
  },
  markdown: {
    syntaxHighlight: false,
  },
  integrations: [
    indiepub({
      title: 'My Site',
      description: 'An IndieWeb site built with IndiePub.',
      author: {
        name: 'Your Name',
        url: 'https://example.com',
      },
      mediaUrl: process.env.MEDIA_URL ?? '',
    }),
    indiepubAdmin(),
  ],
});
