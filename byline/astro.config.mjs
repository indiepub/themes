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
    icon(),
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
    indiepubAdmin({
      palette: {
        providers: [
          {
            id: 'write',
            section: 'Write',
            priority: 1,
            items: [
              { id: 'write-note', label: 'New note (writer)', keywords: ['create', 'write'], action: { type: 'navigate', href: '/write/new?type=note' } },
              { id: 'write-article', label: 'New article (writer)', keywords: ['create', 'write'], action: { type: 'navigate', href: '/write/new?type=article' } },
              { id: 'write-dashboard', label: 'Writer dashboard', keywords: ['write', 'posts', 'drafts'], action: { type: 'navigate', href: '/write' } },
              { id: 'write-redirects', label: 'Redirects (writer)', keywords: ['urls', 'routing'], action: { type: 'navigate', href: '/write/redirects' } },
            ],
          },
        ],
      },
    }),
  ],
});
