---
slug: building-my-own-website
type: article
title: "Building My Own Website with IndieWeb"
published: 2026-02-15T10:00:00Z
visibility: public
tags: [indieweb, web, personal-sites]
summary: >-
  After years of posting on other people's platforms, I finally built a site I fully own. Here's why it matters and how I did it.
---

I've had accounts on every platform you can name. Twitter, Mastodon, Bluebird, whatever came next. And every time, the same thing happened — the platform changed, my archive got harder to export, and I lost control of my own words.

## Why IndieWeb?

The [IndieWeb](https://indieweb.org) is built on a simple idea: **your content should live on a domain you control**. You can still syndicate to other networks, reply to people on Bluesky or Mastodon, and show up in feeds. But the canonical version lives on your site.

That resonated with me. So I built this.

## The stack

This site runs on [IndiePub](https://indiepub.dev), which gives me:

- **Micropub** for posting from any client
- **Webmentions** for cross-site replies
- **RSS and Atom feeds** out of the box
- **Cloudflare Pages** for hosting — fast, cheap, global

The setup took about 20 minutes. Most of that was deciding on a color scheme.

## What I post here

Everything. Notes, articles, bookmarks, photos, what I'm watching and reading. It all lives here first, then gets syndicated out.

```bash
# This is literally how I deploy
git push origin main
```

If you're thinking about building your own site, stop thinking and start building. The IndieWeb community is welcoming and the tooling has never been better.
