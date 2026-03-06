#!/usr/bin/env python3
"""
Import entries from an IndiePub export zip into the local Byline D1 SQLite.

Usage:
  python3 scripts/import-export.py <export.zip> [--db <sqlite-path>]

Finds the local D1 SQLite automatically if --db is not provided.
"""

import json
import sqlite3
import sys
import zipfile
import glob
import os
import argparse
from datetime import datetime, timezone

def find_db():
    pattern = os.path.join(
        os.path.dirname(__file__), '..',
        '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite'
    )
    matches = glob.glob(pattern)
    if not matches:
        sys.exit('ERROR: No local D1 SQLite found. Run `pnpm dev` first to initialise it.')
    if len(matches) > 1:
        print(f'Multiple SQLite files found, using: {matches[0]}', file=sys.stderr)
    return matches[0]

def iso_to_s(s):
    """Convert ISO date string to seconds since epoch.
    Drizzle uses integer('...', { mode: 'timestamp' }) which stores Unix seconds."""
    if not s:
        return None
    try:
        dt = datetime.fromisoformat(s.replace('Z', '+00:00'))
        return int(dt.timestamp())
    except ValueError:
        return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('zip', help='Path to indiepub-export-*.zip')
    parser.add_argument('--db', help='Path to local D1 SQLite file')
    args = parser.parse_args()

    db_path = args.db or find_db()
    print(f'Using DB: {db_path}')

    with zipfile.ZipFile(args.zip) as zf:
        with zf.open('data.json') as f:
            data = json.load(f)

    entries = data['entries']
    print(f'Found {len(entries)} entries in export')

    con = sqlite3.connect(db_path)
    cur = con.cursor()

    # Get the existing author id (the one created during onboarding)
    cur.execute('SELECT id FROM authors LIMIT 1')
    row = cur.fetchone()
    if not row:
        sys.exit('ERROR: No author found in DB. Complete onboarding first.')
    author_id = row[0]
    print(f'Using author_id: {author_id}')

    # Collect all tags (deduplicated)
    all_tags = {}  # tag_id -> {id, slug, name, created_at}
    entry_tags = []  # list of (entry_id, tag_id)

    for entry in entries:
        for et in (entry.get('tags') or []):
            tag = et['tag']
            if tag['id'] not in all_tags:
                all_tags[tag['id']] = tag
            entry_tags.append((entry['id'], tag['id']))

    # Upsert tags
    print(f'Upserting {len(all_tags)} tags...')
    for tag in all_tags.values():
        cur.execute(
            '''INSERT INTO tags (id, slug, name)
               VALUES (?, ?, ?)
               ON CONFLICT(id) DO NOTHING''',
            (tag['id'], tag['slug'], tag['name'])
        )

    # Map export entry type → schema type
    TYPE_MAP = {
        'article':  'article',
        'note':     'note',
        'photo':    'photo',
        'bookmark': 'bookmark',
        'like':     'like',
        'reply':    'reply',
        'repost':   'repost',
        'checkin':  'checkin',
    }

    # Map export visibility → schema visibility
    VIS_MAP = {
        'public':   'public',
        'unlisted': 'unlisted',
        'members':  'members',
        'private':  'private',
    }

    inserted = 0
    skipped = 0

    print(f'Importing {len(entries)} entries...')
    for entry in entries:
        etype = TYPE_MAP.get(entry.get('type', ''), 'note')
        vis   = VIS_MAP.get(entry.get('visibility', 'public'), 'public')

        # Map bookmark url → bookmark_of
        bookmark_of = None
        like_of     = None
        in_reply_to = None
        repost_of   = None
        if etype == 'bookmark':
            bookmark_of = entry.get('url')
        elif etype == 'like':
            like_of = entry.get('url')
        elif etype == 'reply':
            in_reply_to = entry.get('url')
        elif etype == 'repost':
            repost_of = entry.get('url')

        content = entry.get('content') or None
        # Strip empty string
        if content == '':
            content = None

        now_s = int(datetime.now(timezone.utc).timestamp())

        try:
            cur.execute(
                '''INSERT INTO entries (
                     id, type, name, content, summary,
                     in_reply_to, like_of, bookmark_of, repost_of,
                     photo, url, slug, author_id,
                     verb, object_name, object_url, rating,
                     status, visibility,
                     published_at, updated_at, created_at
                   ) VALUES (
                     ?, ?, ?, ?, ?,
                     ?, ?, ?, ?,
                     ?, ?, ?, ?,
                     ?, ?, ?, ?,
                     ?, ?,
                     ?, ?, ?
                   )
                   ON CONFLICT(id) DO NOTHING''',
                (
                    entry['id'],
                    etype,
                    entry.get('title') or None,
                    content,
                    entry.get('summary') or None,
                    in_reply_to,
                    like_of,
                    bookmark_of,
                    repost_of,
                    entry.get('featuredImage') or None,
                    entry.get('url') if etype not in ('bookmark','like','reply','repost') else None,
                    entry['slug'],
                    author_id,
                    entry.get('verb') or None,
                    entry.get('objectName') or None,
                    entry.get('objectUrl') or None,
                    entry.get('rating'),
                    'published',
                    vis,
                    iso_to_s(entry.get('publishedAt')),
                    iso_to_s(entry.get('updatedAt')),
                    iso_to_s(entry.get('createdAt')) or now_s,
                )
            )
            if cur.rowcount > 0:
                inserted += 1
            else:
                skipped += 1
        except sqlite3.IntegrityError as e:
            print(f'  SKIP {entry["slug"]}: {e}', file=sys.stderr)
            skipped += 1

    # Upsert entry_tags
    print(f'Linking {len(entry_tags)} entry-tag associations...')
    for (entry_id, tag_id) in entry_tags:
        cur.execute(
            '''INSERT INTO entry_tags (entry_id, tag_id)
               VALUES (?, ?)
               ON CONFLICT DO NOTHING''',
            (entry_id, tag_id)
        )

    con.commit()
    con.close()

    print(f'\nDone. Inserted: {inserted}, Skipped (already existed): {skipped}')

if __name__ == '__main__':
    main()
