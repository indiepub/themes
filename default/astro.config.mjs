import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import icon from 'astro-icon';
import { indiepub } from '@indiepub/astro';
import { indiepubAdmin } from '@indiepub/admin';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: 'cloudflare',
  }),
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
          'arrow-right', 'bookmark', 'corner-down-right', 'external-link',
          'file-text', 'globe', 'heart', 'link', 'lock', 'log-out',
          'mail', 'menu', 'message-circle', 'message-square', 'monitor',
          'moon', 'paperclip', 'repeat-2', 'rss', 'sun', 'trash-2',
          'user', 'x',
        ],
        'simple-icons': [
          'bluesky', 'codepen', 'dribbble', 'github', 'gitlab',
          'instagram', 'linkedin', 'mastodon', 'threads', 'twitch',
          'x', 'youtube',
        ],
      },
    }),
    indiepub({
      title: 'My IndieWeb Site',
      description: 'An IndieWeb site built with IndiePub.',
      author: {
        name: 'Your Name',
        url: 'https://example.com',
      },
      subscriptions: {
        enabled: true,
        fromEmail: 'hello@example.com',
      },
      // Public R2 bucket domain. Set MEDIA_URL=https://media.example.com in .dev.vars
      // (or wrangler.toml [vars]) for production. Leave empty for local dev.
      mediaUrl: process.env.MEDIA_URL ?? '',
    }),
    indiepubAdmin(),
  ],
});
