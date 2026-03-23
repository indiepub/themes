---
slug: sqlite-is-enough
type: article
title: "SQLite Is Enough"
published: 2026-02-18T10:00:00Z
visibility: public
tags: [databases, architecture]
summary: "You probably don't need Postgres for your side project. SQLite handles more than you think."
---

I have a bad habit of reaching for Postgres before I've written a single line of application code. New project? Spin up a database. Docker compose, connection pooling, migrations, backups. I haven't even built the thing yet and I'm already managing infrastructure.

For my last three side projects, I used SQLite instead. Here's what I learned.

## What SQLite actually handles

The mental model most developers have of SQLite is "that embedded database for mobile apps." Which is true, but incomplete. SQLite handles:

- Millions of rows without breaking a sweat
- Concurrent reads (with WAL mode)
- Full-text search (FTS5)
- JSON functions
- Window functions
- CTEs

Cloudflare's D1 is literally SQLite at the edge. Turso built a company around distributed SQLite. Litestream streams SQLite to S3 for backups. The ecosystem is real.

## When it's not enough

SQLite has real limitations. If you need multiple processes writing concurrently, you'll hit lock contention. If you need replication across regions, you need something on top of SQLite (like Turso or LiteFS). If you need pub/sub or `LISTEN`/`NOTIFY`, that's Postgres territory.

But for a blog? A personal site? A tool with a few hundred users? SQLite is not just "enough" — it's better. Zero operational overhead. Your database is a file. Back it up by copying it. Deploy it alongside your application.

## The real lesson

The lesson isn't "SQLite good, Postgres bad." It's: match your tools to your actual requirements, not your imagined future requirements. I've wasted more hours configuring database infrastructure for projects that never exceeded 1,000 rows than I'd like to admit.

Start with SQLite. You can always migrate later. You probably won't need to.
