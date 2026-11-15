// Seeds the database with a demo-content folder (the themes repo's
// demo-content/daemon by default): pnpm seed [dir]
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { entryBySlug, updateAuthor } from '@indiepub/stator/server/entries';
import { importEntry, importInteractions, importSubscribers } from '@indiepub/stator/server/import';
import { mediaDir, probeLocalImage } from '@indiepub/stator/server/media';
import { mediaUrl } from '@indiepub/stator/server/site';

const dir = resolve(process.argv[2] ?? '../demo-content/daemon');
if (!existsSync(dir)) {
  console.error(`No demo content at ${dir}`);
  process.exit(1);
}

const unquote = (v) => v.trim().replace(/^(['"])(.*)\1$/, '$2');

/** The frontmatter subset the demo content uses: scalars, `[a, b]` lists and
 *  `>-` folded blocks. */
function parse(file) {
  const text = readFileSync(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, body: text.trim() };
  const data = {};
  const lines = match[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    const key = kv[1].replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
    let value = kv[2].trim();
    if (value === '>-' || value === '>' || value === '|') {
      const block = [];
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) block.push(lines[++i].trim());
      value = block.join(value === '|' ? '\n' : ' ');
    } else if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(unquote).filter(Boolean);
    } else {
      value = unquote(value);
    }
    data[key] = value;
  }
  return { data, body: match[2].trim() };
}

const mdFiles = (sub) => {
  const path = join(dir, sub);
  return existsSync(path) && statSync(path).isDirectory()
    ? readdirSync(path).filter((f) => f.endsWith('.md')).map((f) => join(path, f))
    : [];
};

const TYPES = { 'image/avif': 'avif', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const typeOf = (file) => Object.keys(TYPES).find((t) => `.${TYPES[t]}` === extname(file).toLowerCase()) ?? 'image/jpeg';

/** Copies a demo asset under the media directory and returns it as a photo. */
function photo(rel, alt) {
  const src = join(dir, rel);
  if (!existsSync(src)) return null;
  const key = `demo/${basename(rel)}`;
  mkdirSync(join(mediaDir(), 'demo'), { recursive: true });
  copyFileSync(src, join(mediaDir(), key));
  const url = mediaUrl(key);
  const dims = probeLocalImage(url);
  return {
    url,
    contentType: typeOf(rel),
    width: dims?.width ?? null,
    height: dims?.height ?? null,
    alt,
    size: statSync(src).size,
  };
}

const profiles = existsSync(join(dir, 'profiles.json')) ? JSON.parse(readFileSync(join(dir, 'profiles.json'), 'utf8')) : [];
const primary = profiles.find((p) => p.isPrimary) ?? profiles[0];
if (primary) {
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

const SECTIONS = ['articles', 'notes', 'photos', 'bookmarks', 'likes', 'reposts'];
const slugByFile = new Map();
let entries = 0;
for (const file of SECTIONS.flatMap(mdFiles)) {
  const { data, body } = parse(file);
  const slug = data.slug ?? basename(file, '.md');
  slugByFile.set(basename(file, '.md'), slug);
  const photos = [data.photo ?? []].flat().map((rel) => photo(rel, data.summary ?? body.slice(0, 120))).filter(Boolean);
  const { created } = importEntry({
    type: data.type,
    slug,
    name: data.title ?? null,
    content: body,
    summary: data.summary ?? null,
    tags: data.tags ?? [],
    inReplyTo: data.inReplyTo ?? null,
    likeOf: data.likeOf ?? null,
    repostOf: data.repostOf ?? null,
    bookmarkOf: data.bookmarkOf ?? (data.type === 'bookmark' ? data.url : null) ?? null,
    verb: data.verb ?? null,
    objectName: data.objectName ?? null,
    objectUrl: data.objectUrl ?? null,
    rating: data.rating ? Number(data.rating) : null,
    photos,
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
    const entry = entryBySlug(slugByFile.get(folder) ?? folder, { publishedOnly: false });
    if (!entry) continue;
    const items = mdFiles(join('interactions', folder)).map((file) => {
      const { data, body } = parse(file);
      return {
        type: data.type,
        source: data.source,
        authorName: data.authorName ?? null,
        authorUrl: data.authorUrl ?? null,
        authorPhoto: data.authorPhoto ?? null,
        content: body || null,
        url: data.externalUrl ?? null,
        status: data.status === 'pending' ? 'pending' : 'approved',
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      };
    });
    interactions += importInteractions(entry.id, items);
  }
}

const subscribersFile = join(dir, 'subscribers.json');
const subscribers = existsSync(subscribersFile)
  ? importSubscribers(
      JSON.parse(readFileSync(subscribersFile, 'utf8'))
        .filter((s) => (s.status ?? 'active') === 'active')
        .map((s) => ({ ...s, subscribedAt: s.subscribedAt ? new Date(s.subscribedAt) : undefined })),
    )
  : 0;

console.log(`Seeded ${entries} entries, ${interactions} interactions and ${subscribers} subscribers from ${dir}`);
