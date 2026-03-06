import { hostname } from '../lib/format.ts';

export function syndicationMeta(url: string): { icon: string; label: string } {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const path = parsed.pathname;
    if (host === 'bsky.app' || host.endsWith('.bsky.app')) {
      return { icon: 'simple-icons:bluesky', label: 'Bluesky' };
    }
    if (host === 'twitter.com' || host === 'x.com') {
      return { icon: 'simple-icons:x', label: 'X' };
    }
    if (/\/@[^/]+\/\d+/.test(path)) {
      return { icon: 'simple-icons:mastodon', label: 'Mastodon' };
    }
  } catch {
    // ignore malformed URLs
  }
  return { icon: 'lucide:external-link', label: hostname(url) };
}
