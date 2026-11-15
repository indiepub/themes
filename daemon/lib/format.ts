const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const dateCompactFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDateCompact(date: Date): string {
  return dateCompactFormatter.format(date);
}

export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function syndicationMeta(url: string): { icon: string; label: string } {
  try {
    const { hostname: host, pathname } = new URL(url);
    if (host === 'bsky.app' || host.endsWith('.bsky.app')) return { icon: 'social/bluesky', label: 'Bluesky' };
    if (host === 'twitter.com' || host === 'x.com') return { icon: 'social/x', label: 'X' };
    if (/\/@[^/]+\/\d+/.test(pathname)) return { icon: 'social/mastodon', label: 'Mastodon' };
  } catch {
    // A malformed URL falls through to the generic link.
  }
  return { icon: 'external-link', label: hostname(url) };
}

/** The list each post type belongs to, for the post page's back link. */
export function sectionOf(type: string): { href: string; label: string } {
  if (type === 'article') return { href: '/articles', label: 'Articles' };
  if (type === 'photo') return { href: '/photos', label: 'Photos' };
  if (type === 'bookmark') return { href: '/bookmarks', label: 'Bookmarks' };
  return { href: '/notes', label: 'Notes' };
}
