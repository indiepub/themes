# @indiepub/theme-daemon

A full-featured [IndiePub](https://indiepub.dev) theme on [Stator](https://statorjs.dev): a card layout with a sidebar, a page per post type, a `/now` page, a photo grid and a light/dark toggle.

## Pages

- `/`: profile, the latest `#now` note, recent writing and notes
- `/notes`, `/articles`, `/photos`, `/bookmarks`: one list per post type (notes include replies, likes, reposts, check-ins and activities)
- `/now`: the most recent note tagged `#now`
- `/about`: profile and links
- `/<slug>`: every post, with its likes, reposts and replies
- `/tags/<tag>`, `/subscribe`, `/newsletter` (past issues)

Old `/posts/<slug>`, `/notes/<slug>`, `/articles/<slug>` and `/photos/<slug>` links redirect to `/<slug>`.

## What's here

- `routes/*.stator`: the public pages.
- `templates/`: the layout and the cards, callouts and lists the pages share.
- `static/global.css`: the tokens and base styles. Change `--brand-hue` at the top to repaint the site. `static/daemon.js` runs the theme toggle, the mobile menu and the photo carousels.
- `lib/icons.ts`: the inline SVG icons.
- Everything else under `routes/` and `machines/` is a one-line mount of `@indiepub/stator`: the admin at `/admin`, Micropub, IndieAuth, webmentions, feeds, subscriptions, the newsletter and its archive at `/newsletter`, syndication and the Open Graph cards.

Posts are written in the admin's composer at `/admin`; signed in as the owner, the site's header links there.

## Local development

You need Node 24 and pnpm. `@indiepub/stator` installs from `registry.indiepub.dev` with your license token:

```bash
export INDIEPUB_NPM_TOKEN=…   # from indiepub.dev/account
pnpm install
cp .env.example .env.local    # set SITE_OWNER_EMAIL
pnpm seed                     # optional: demo posts from ../demo-content/daemon
pnpm dev
```

Open `http://localhost:3000/admin` and ask for a sign-in link; without `RESEND_API_KEY` it prints in the terminal. The database (`site.db`) is created and migrated on first run.

`pnpm check` typechecks routes, templates and the package; `pnpm build` checks and compiles to `dist/`.

## Deploy to Fly

```bash
fly launch --no-deploy        # then edit app, SITE_ORIGIN, SITE_NAME, SITE_AUTHOR in fly.toml
fly volumes create data --size 1
fly secrets set STATOR_SECRET=… SITE_OWNER_EMAIL=… RESEND_API_KEY=… SITE_ENCRYPTION_KEY=…
fly deploy --build-secret INDIEPUB_NPM_TOKEN="$INDIEPUB_NPM_TOKEN"
```

Run exactly one machine: sessions, live updates and background work (including backfeed from Bluesky and Mastodon) are in-process.
