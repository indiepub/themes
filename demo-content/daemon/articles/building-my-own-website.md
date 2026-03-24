---
slug: building-my-own-website
type: article
title: "Why I Built My Own Website"
published: 2026-02-15T10:00:00Z
visibility: public
tags: [indieweb, web, personal-sites]
summary: >-
  I spent a decade posting on other people's platforms. Then I stopped and built this instead.
---

I've had accounts everywhere. Twitter before it was X, Tumblr before Yahoo killed it, Medium before the paywalls. Every time, the same story — the platform changes, your archive gets locked behind an export button that may or may not work, and you realize you were always a guest.

## The idea that clicked

The [IndieWeb](https://indieweb.org) community talks about **POSSE** — Publish on your Own Site, Syndicate Elsewhere. Your site is the source of truth. Everything else is a copy.

That clicked for me. I don't need to quit Bluesky or Mastodon. I just need a place where my words live that isn't subject to someone else's product decisions.

## What this site does

This is an [IndiePub](https://indiepub.dev) site. Out of the box I get:

- **Micropub** — I can post from any Micropub client
- **Webmentions** — cross-site replies, likes, and reposts
- **Feeds** — RSS, Atom, and JSON Feed for subscribers
- **Syndication** — my posts go to Bluesky and Mastodon automatically

The whole thing runs on Cloudflare Workers. No servers to manage, no Docker containers, no `apt-get upgrade` at 2am.

## All the post types

I don't just write articles here. I post notes, bookmark links, share photos, log what I'm reading and watching, reply to people on other sites. It all lives here in one timeline.

```html
<!-- My site has an h-feed. Remember those? -->
<section class="h-feed">
  <article class="h-entry">...</article>
</section>
```

If you're a developer and you've been meaning to build a personal site — this is the nudge. It took me an afternoon to set up and I haven't looked back.
