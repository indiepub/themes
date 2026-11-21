// Seeds a database with a demo-content folder (the themes repo's
// demo-content/timeline by default): pnpm seed [dir]
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { entryBySlug, getAuthor, updateAuthor } from '@indiepub/stator/server/entries';
import { importEntry, importInteractions, importSubscribers } from '@indiepub/stator/server/import';
import { mediaDir, probeLocalImage } from '@indiepub/stator/server/media';
import { mediaUrl } from '@indiepub/stator/server/site';

const dir = resolve(process.argv[2] ?? '../demo-content/timeline');
if (!existsSync(dir)) {
  console.error(`No demo content at ${dir}`);
  process.exit(1);
}

function parse(file) {
  const text = readFileSync(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, body: text.trim() };
  const data = {};
  const lines = match[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value === '>-' || value === '|') {
      const folded = [];
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) folded.push(lines[++i].trim());
      value = folded.join(value === '|' ? '\n' : ' ');
    } else if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else {
      value = value.replace(/^['"]|['"]$/g, '');
    }
    data[kv[1]] = value;
  }
  return { data, body: match[2].trim() };
}

const mdFiles = (sub) => {
  const path = join(dir, sub);
  if (!existsSync(path) || !statSync(path).isDirectory()) return [];
  return readdirSync(path).filter((f) => f.endsWith('.md')).map((f) => join(path, f));
};

const TYPES = { 'image/avif': 'avif', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const CONTENT_TYPES = Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [`.${v}`, k]));

function importPhoto(rel, slug, i) {
  const src = join(dir, rel);
  if (!existsSync(src)) return null;
  const ext = extname(src).toLowerCase();
  const key = `uploads/demo/${i === 0 ? slug : `${slug}-${i + 1}`}${ext}`;
  mkdirSync(join(mediaDir(), 'uploads/demo'), { recursive: true });
  copyFileSync(src, join(mediaDir(), key));
  const url = mediaUrl(key);
  const probe = probeLocalImage(url);
  return {
    url,
    contentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
    width: probe?.width ?? null,
    height: probe?.height ?? null,
    alt: '',
    size: statSync(src).size,
  };
}

const profiles = existsSync(join(dir, 'profiles.json')) ? JSON.parse(readFileSync(join(dir, 'profiles.json'), 'utf8')) : [];
const primary = profiles.find((p) => p.isPrimary) ?? profiles[0];
if (primary && !getAuthor().bio) {
  updateAuthor({
    name: primary.displayName,
    url: process.env.SITE_ORIGIN ?? null,
    email: null,
    bio: primary.bio ?? null,
    nickname: null,
    pronouns: null,
    atDid: null,
    atHandle: null,
    mastodonHandle: null,
  });
}

const list = (v) => (Array.isArray(v) ? v : v ? [v] : []);
let entries = 0;
for (const file of ['articles', 'notes', 'photos', 'bookmarks', 'likes', 'reposts'].flatMap(mdFiles)) {
  const { data, body } = parse(file);
  const slug = data.slug ?? basename(file, '.md');
  const photos = list(data.photo).map((rel, i) => importPhoto(rel, slug, i)).filter(Boolean);
  const { created } = importEntry({
    slug,
    type: data.type,
    name: data.title ?? null,
    content: body,
    summary: data.summary ?? null,
    tags: list(data.tags),
    photos,
    bookmarkOf: data.bookmarkOf ?? data['bookmark-of'] ?? (data.type === 'bookmark' ? data.url : null) ?? null,
    likeOf: data.like_of ?? data['like-of'] ?? null,
    repostOf: data.repost_of ?? data['repost-of'] ?? null,
    inReplyTo: data.in_reply_to ?? data['in-reply-to'] ?? null,
    verb: data.verb ?? null,
    objectName: data['object-name'] ?? null,
    objectUrl: data['object-url'] ?? null,
    rating: data.rating ? Number(data.rating) : null,
    visibility: data.visibility ?? 'public',
    status: data.status === 'draft' ? 'draft' : 'published',
    publishedAt: data.published ? new Date(data.published) : undefined,
  });
  if (created) entries++;
}

let interactions = 0;
const interactionsDir = join(dir, 'interactions');
if (existsSync(interactionsDir)) {
  for (const folder of readdirSync(interactionsDir)) {
    const items = mdFiles(join('interactions', folder)).map((file) => {
      const { data, body } = parse(file);
      return {
        type: data.type,
        source: data.source,
        authorName: data.authorName ?? null,
        authorUrl: data.authorUrl ?? null,
        authorPhoto: data.authorPhoto ?? null,
        url: data.externalUrl ?? null,
        content: body || null,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      };
    });
    const entry = entryBySlug(folder, { publishedOnly: false });
    if (entry && items.length) interactions += importInteractions(entry.id, items);
  }
}

let subscribers = 0;
if (existsSync(join(dir, 'subscribers.json'))) {
  const list = JSON.parse(readFileSync(join(dir, 'subscribers.json'), 'utf8'));
  subscribers = importSubscribers(
    list
      .filter((s) => (s.status ?? 'active') === 'active')
      .map((s) => ({ email: s.email, name: s.name ?? null, tier: s.tier, subscribedAt: s.subscribedAt ? new Date(s.subscribedAt) : undefined })),
  );
}

console.log(`Seeded ${entries} entries, ${interactions} interactions and ${subscribers} subscribers from ${dir}`);
