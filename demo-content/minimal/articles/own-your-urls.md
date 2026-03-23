---
slug: own-your-urls
type: article
title: "Own Your URLs"
published: 2026-01-15T09:00:00Z
visibility: public
tags: [indieweb, web]
summary: "Every URL you publish on someone else's platform is a URL you don't control. Here's why that matters and what to do about it."
---

I've been thinking about URLs lately. Not in a "cool URIs don't change" academic sense, but in a very practical one: who controls the address where your writing lives?

Every post I wrote on Medium lives at `medium.com/@alexchen/whatever`. I don't control that domain. I can't set up redirects if I move. If Medium changes their URL scheme, decides to put my posts behind a paywall I didn't ask for, or shuts down — those links are dead.

## The web is made of links

This sounds obvious, but it's worth saying: the entire web is built on the assumption that URLs are stable. When you share a link in a README, cite a blog post in documentation, or bookmark something useful — you're trusting that URL to keep working.

When you publish on your own domain, you make that promise yourself. When you publish on a platform, someone else makes that promise for you. And they can break it whenever they want.

## What I actually did

I moved my blog to my own domain. The technical details aren't interesting (it's an Astro site on Cloudflare Workers). What matters is:

- I own `alexchen.dev`
- Every post has a URL I control
- I set up redirects from my old Medium posts
- My RSS feed is at a URL I control
- My subscribers are in a database I control

None of this required building anything from scratch. The IndieWeb community has been thinking about this for years, and the tooling is finally good enough that it's not a weekend project anymore.

## It's not about the technology

The point isn't "self-host everything." The point is: be intentional about what you publish where, and understand what you're giving up when you publish on someone else's domain.

Your personal site doesn't need to be fancy. It doesn't need a design system or a component library. It needs to exist, at a URL you control, and it needs to keep working.
