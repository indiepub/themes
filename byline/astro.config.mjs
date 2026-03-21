import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import icon from 'astro-icon';
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
    icon({
      include: {
        lucide: [
          'arrow-left', 'bookmark', 'chevron-down', 'clapperboard',
          'code', 'external-link', 'heart', 'image', 'link', 'menu',
          'paperclip', 'pen-line', 'pencil', 'quote', 'repeat-2',
          'reply', 'settings', 'trash-2',
        ],
        'simple-icons': [
          'bluesky', 'codepen', 'dribbble', 'github', 'gitlab',
          'instagram', 'linkedin', 'mastodon', 'threads', 'twitch',
          'x', 'youtube',
        ],
      },
    }),
    indiepub({
      title: 'My Publication',
      description: 'A newsletter and blog built with IndiePub.',
      author: {
        name: 'Your Name',
        url: 'https://yourdomain.com',
      },
      subscriptions: {
        enabled: true,
        fromEmail: 'hello@yourdomain.com',
      },
      // Public R2 bucket domain. Set MEDIA_URL=https://media.yourdomain.com in .dev.vars
      // (or wrangler.toml [vars]) for production. Leave empty for local dev.
      mediaUrl: process.env.MEDIA_URL ?? '',
    }),
    indiepubAdmin(),
  ],
});
