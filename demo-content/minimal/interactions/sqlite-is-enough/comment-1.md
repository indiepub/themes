---
type: comment
authorName: "Ben Hoyt"
authorUrl: "https://benhoyt.com"
createdAt: 2026-02-19T15:00:00Z
---

Great write-up. Worth mentioning that SQLite's `PRAGMA journal_mode=WAL` is basically a cheat code — it gives you concurrent readers with a single writer, which covers most web app patterns.
