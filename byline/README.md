# @indiepub/theme-byline

A writer-focused [IndiePub](https://indiepub.dev) theme on [Stator](https://statorjs.dev): an editorial publication in Lora serif, with a newsletter front and center. Articles get a long-form reading column, notes a compact card stream, and every post ends with a subscribe call.

## What's here

- `routes/*.stator`: the public pages: the front page (masthead and recent articles), `/articles` and `/archive` by year, `/notes`, `/about`, `/tags/<tag>`, the post page at `/<slug>`, `/subscribe` and its confirmation page, 404. Old `/posts/<slug>` links redirect.
- `templates/`: the layout, header, footer and the pieces the pages share.
- `static/global.css`: the tokens, palettes, base styles and prose. Each template styles itself in a scoped `<style>`.
- `lib/icons.ts`: the few inline SVG icons.
- Everything else under `routes/` and `machines/` is a one-line mount of `@indiepub/stator`: the admin at `/admin` (`/write` sends you there), Micropub, IndieAuth, webmentions, feeds, subscriptions, members-only posts, syndication and the Open Graph cards.

## Look

Four palettes ship in `static/global.css`: `ivory` (default), `slate`, `midnight` and `sepia`. Pick one with `SITE_PALETTE`, and tint the accent with `SITE_ACCENT` (any CSS color, e.g. `oklch(50% 0.14 240)`).

## Local development

You need Node 24 and pnpm. `@indiepub/stator` installs from `registry.indiepub.dev` with your license token:

```bash
export INDIEPUB_NPM_TOKEN=…   # from indiepub.dev/account
pnpm install
cp .env.example .env.local    # set SITE_OWNER_EMAIL
pnpm seed                     # optional: demo posts from ../demo-content/byline
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

Run exactly one machine: sessions, live updates and background work are in-process.
