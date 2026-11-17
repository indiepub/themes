// Seeds an empty database with a demo-content folder (the themes repo's
// demo-content/minimal by default): pnpm seed [dir]
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { createEntry, entryBySlug, genId, getDb, updateAuthor } from '@indiepub/stator/server/entries';

const dir = resolve(process.argv[2] ?? '../demo-content/minimal');
if (!existsSync(dir)) {
  console.error(`No demo content at ${dir}`);
  process.exit(1);
}

function parse(file) {
  const text = readFileSync(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, body: text.trim() };
  const data = {};
  for (const line of match[1].split('\n')) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith('[') && value.endsWith(']')) {
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
  return existsSync(path) ? readdirSync(path).filter((f) => f.endsWith('.md')).map((f) => join(path, f)) : [];
};

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

const slugByFile = new Map();
let entries = 0;
for (const file of ['articles', 'notes', 'bookmarks'].flatMap(mdFiles)) {
  const { data, body } = parse(file);
  const slug = data.slug ?? basename(file, '.md');
  slugByFile.set(basename(file, '.md'), slug);
  if (entryBySlug(slug, { publishedOnly: false })) continue;
  const draft = data.status === 'draft';
  createEntry({
    type: data.type ?? 'note',
    slug,
    name: data.title ?? null,
    content: body,
    summary: data.summary ?? null,
    tags: data.tags ?? [],
    bookmarkOf: data.bookmarkOf ?? data['bookmark-of'] ?? null,
    verb: data.verb ?? null,
    objectName: data['object-name'] ?? null,
    objectUrl: data['object-url'] ?? null,
    rating: data.rating ? Number(data.rating) : null,
    visibility: data.visibility ?? 'public',
    status: draft ? 'draft' : 'published',
    publishedAt: data.published ? new Date(data.published) : undefined,
    url: `${process.env.SITE_ORIGIN ?? 'http://localhost:3000'}/${slug}`,
  });
  entries++;
}

const db = getDb();
const insertInteraction = db.prepare(
  `INSERT INTO interactions (id, entry_id, type, source, author_name, author_url, content, status, created_at)
   VALUES (?, ?, ?, 'webmention', ?, ?, ?, 'approved', ?)`,
);
let interactions = 0;
const interactionsDir = join(dir, 'interactions');
if (existsSync(interactionsDir)) {
  for (const folder of readdirSync(interactionsDir)) {
    const entry = entryBySlug(slugByFile.get(folder) ?? folder, { publishedOnly: false });
    if (!entry) continue;
    const existing = db.prepare('SELECT count(*) n FROM interactions WHERE entry_id = ?').get(entry.id);
    if (existing.n > 0) continue;
    for (const file of mdFiles(join('interactions', folder))) {
      const { data, body } = parse(file);
      const at = Math.floor(new Date(data.createdAt ?? Date.now()).getTime() / 1000);
      insertInteraction.run(genId(), entry.id, data.type, data.authorName ?? null, data.authorUrl ?? null, body || null, at);
      interactions++;
    }
  }
}

console.log(`Seeded ${entries} entries and ${interactions} interactions from ${dir}`);
