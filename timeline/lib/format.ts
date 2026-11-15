import type { Shown } from '@indiepub/stator/server/access';
import { requiredAudience } from '@indiepub/stator/server/access';

const long = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const compact = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDate = (d: Date): string => long.format(d);
export const formatDateCompact = (d: Date): string => compact.format(d);

export const pubDate = (entry: Shown): Date => entry.publishedAt ?? entry.createdAt;

export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** "Members" or "Paid" for a gated post, as its reader needs it today. */
export function audienceLabel(entry: Shown): string | null {
  if (entry.visibility !== 'members' && entry.visibility !== 'paid') return null;
  return requiredAudience(entry.visibility) === 'paid' ? 'Paid' : 'Members';
}

const TYPE_BADGE: Partial<Record<string, string>> = {
  article: 'article',
  photo: 'photo',
  bookmark: 'bookmark',
  reply: 'reply',
  like: 'like',
  repost: 'repost',
  video: 'video',
  checkin: 'checkin',
  rsvp: 'rsvp',
  event: 'event',
  watch: 'watched',
  read: 'read',
  listen: 'listened',
  play: 'played',
  eat: 'ate',
};

export const typeBadge = (entry: Shown): string | undefined =>
  entry.type === 'note' ? undefined : TYPE_BADGE[entry.type];

const SECTIONS: Partial<Record<string, [string, string]>> = {
  note: ['/notes', 'Notes'],
  article: ['/articles', 'Articles'],
  photo: ['/photos', 'Photos'],
  bookmark: ['/bookmarks', 'Bookmarks'],
};

export const backLink = (entry: Shown): [string, string] => SECTIONS[entry.type] ?? ['/', 'Feed'];

export function syndicationMeta(url: string): { icon: string; label: string } {
  try {
    const { hostname: host, pathname } = new URL(url);
    if (host === 'bsky.app' || host.endsWith('.bsky.app')) return { icon: 'social/bluesky', label: 'Bluesky' };
    if (host === 'twitter.com' || host === 'x.com') return { icon: 'social/x', label: 'X' };
    if (/\/@[^/]+\/\d+/.test(pathname)) return { icon: 'social/mastodon', label: 'Mastodon' };
  } catch {
    // fall through
  }
  return { icon: 'external-link', label: hostname(url) };
}

const SOCIAL_ICONS: Record<string, string> = {
  github: 'social/github',
  mastodon: 'social/mastodon',
  bluesky: 'social/bluesky',
  twitter: 'social/x',
  x: 'social/x',
  linkedin: 'social/linkedin',
  instagram: 'social/instagram',
  youtube: 'social/youtube',
  twitch: 'social/twitch',
  threads: 'social/threads',
  gitlab: 'social/gitlab',
  codepen: 'social/codepen',
  dribbble: 'social/dribbble',
  rss: 'rss',
  email: 'mail',
  website: 'globe',
};

export const socialIcon = (name: string): string => SOCIAL_ICONS[name.toLowerCase()] ?? 'link';

export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export const PER_PAGE = 30;

/** The `?page=` number, from 1. */
export function pageOf(query: Record<string, unknown>): number {
  return Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
}

/** Fetches one extra row to learn whether an older page exists. */
export function paginate<T>(fetch: (limit: number, offset: number) => T[], page: number) {
  const rows = fetch(PER_PAGE + 1, (page - 1) * PER_PAGE);
  return { items: rows.slice(0, PER_PAGE), hasPrev: page > 1, hasNext: rows.length > PER_PAGE };
}
