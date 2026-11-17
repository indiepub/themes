// Seeds the database with a demo-content folder (the themes repo's
// demo-content/minimal by default): pnpm seed [dir]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { entryBySlug, getAuthor, updateAuthor } from '@indiepub/stator/server/entries';
import { importEntry, importInteractions, importSubscribers } from '@indiepub/stator/server/import';

const dir = resolve(process.argv[2] ?? '../demo-content/minimal');
if (!existsSync(dir)) {
  console.error(`No demo content at ${dir}`);
  process.exit(1);
}

const unquote = (s) => s.trim().replace(/^(['"])(.*)\1$/, '$2');

/** Front matter of flat `key: value` lines, `[a, b]` lists and `>-` folded blocks. */
function parse(file) {
  const text = readFileSync(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) return { data: {}, body: text.trim() };
  const data = {};
  const lines = match[1].split('\n');
  for (let i = 0; i < lines.length; i++) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    const [, key, raw] = kv;
    let value = raw.trim();
    if (/^[>|][-+]?$/.test(value)) {
      const block = [];
      while (i + 1 < lines.length && /^\s+\S|^\s*$/.test(lines[i + 1])) block.push(lines[++i].trim());
      value = block.join(value.startsWith('>') ? ' ' : '\n').trim();
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
  return existsSync(path) ? readdirSync(path).filter((f) => f.endsWith('.md')).map((f) => join(path, f)) : [];
};
const readJson = (name) => (existsSync(join(dir, name)) ? JSON.parse(readFileSync(join(dir, name), 'utf8')) : []);

const profiles = readJson('profiles.json');
const primary = profiles.find((p) => p.isPrimary) ?? profiles[0];
if (primary) {
  const current = getAuthor();
  updateAuthor({
    name: primary.displayName,
    url: process.env.SITE_ORIGIN ?? null,
    email: current.email ?? null,
    bio: primary.bio ?? null,
    nickname: null,
    pronouns: null,
    atDid: current.atDid ?? null,
    atHandle: current.atHandle ?? null,
    mastodonHandle: current.mastodonHandle ?? null,
  });
}

const slugByFile = new Map();
let entries = 0;
for (const file of ['articles', 'notes', 'bookmarks'].flatMap(mdFiles)) {
  const { data, body } = parse(file);
  const slug = data.slug ?? basename(file, '.md');
  slugByFile.set(basename(file, '.md'), slug);
  const { created } = importEntry({
    type: data.type,
    slug,
    name: data.title ?? null,
    content: body,
    summary: data.summary ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    bookmarkOf: data.bookmarkOf ?? data['bookmark-of'] ?? null,
    verb: data.verb ?? null,
    objectName: data['object-name'] ?? null,
    objectUrl: data['object-url'] ?? null,
    rating: data.rating ? Number(data.rating) : null,
    visibility: data.visibility ?? 'public',
    status: data.status === 'draft' || !data.published ? 'draft' : 'published',
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
        entrySlug: data.entrySlug ?? slugByFile.get(folder) ?? folder,
        type: data.type,
        source: data.source,
        authorName: data.authorName ?? null,
        authorUrl: data.authorUrl ?? null,
        authorPhoto: data.authorPhoto ?? null,
        content: body || null,
        url: data.externalUrl ?? null,
        status: data.status === 'pending' || data.status === 'hidden' ? data.status : 'approved',
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      };
    });
    for (const slug of new Set(items.map((i) => i.entrySlug))) {
      const entry = entryBySlug(slug, { publishedOnly: false });
      if (!entry) continue;
      interactions += importInteractions(
        entry.id,
        items.filter((i) => i.entrySlug === slug).map(({ entrySlug, ...item }) => item),
      );
    }
  }
}

const subscribers = importSubscribers(
  readJson('subscribers.json')
    .filter((s) => (s.status ?? 'active') === 'active')
    .map((s) => ({
      email: s.email,
      name: s.name ?? null,
      tier: s.tier,
      subscribedAt: s.subscribedAt ? new Date(s.subscribedAt) : undefined,
    })),
);

console.log(`Seeded ${entries} entries, ${interactions} interactions and ${subscribers} subscribers from ${dir}`);
