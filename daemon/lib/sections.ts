import { ACTIVITY_VERBS } from '@indiepub/stator/server/render';

export const NAV = [
  { href: '/now', label: 'Now', icon: 'clock' },
  { href: '/notes', label: 'Notes', icon: 'message-circle' },
  { href: '/articles', label: 'Articles', icon: 'file-text' },
  { href: '/photos', label: 'Photos', icon: 'image' },
  { href: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' },
] as const;

/** Every short-form type the Notes list shows. */
export const NOTE_TYPES = ['note', 'reply', 'like', 'repost', 'checkin', 'video', ...ACTIVITY_VERBS];
