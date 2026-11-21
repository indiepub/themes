# @indiepub/theme-timeline

A feed-based [IndiePub](https://indiepub.dev) theme on [Stator](https://statorjs.dev): a persistent sidebar profile beside one unified timeline, like a social media profile you own.

## Pages

- `/`: the home timeline, every post type (the signed-in owner gets a note composer on top)
- `/notes`, `/articles`, `/photos`, `/bookmarks`: filtered sections (`/photos` is a grid)
- `/now`: the latest note tagged `#now`; `/tags/now` keeps the history
- `/<slug>`: the post page (old `/posts/<slug>` links redirect)
- `/tags/<tag>`, `/about`, `/subscribe`, `/newsletter` (past issues)

## What's here

- `routes/*.stator`: the public pages.
- `templates/`: the layout, the sidebar, the feed cards and the post page.
- `static/global.css`: tokens, base styles and prose. Change `--brand-hue` at the top to repaint the site; dark mode follows the toggle or the system.
- `static/timeline.js`: the mobile menu and the theme toggle.
- Everything else under `routes/` and `machines/` is a one-line mount of `@indiepub/stator`: the admin at `/admin`, Micropub, IndieAuth, webmentions, feeds, subscriptions, the newsletter and its archive at `/newsletter`, syndication and the Open Graph cards.

## Local development

You need Node 24 and pnpm. `@indiepub/stator` installs from `registry.indiepub.dev` with your license token:

```bash
export INDIEPUB_NPM_TOKEN=…   # from indiepub.dev/account
pnpm install
cp .env.example .env.local    # set SITE_OWNER_EMAIL
pnpm seed                     # optional: demo posts from ../demo-content/timeline
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
