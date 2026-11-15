# @indiepub/theme-minimal

A bare-bones [IndiePub](https://indiepub.dev) theme on [Stator](https://statorjs.dev): one stylesheet, a handful of pages, everything else from `@indiepub/stator`.

## What's here

- `routes/*.stator`: the public pages (home, notes, articles, archive, about, tags, the post page at `/<slug>`, subscribe, 404).
- `templates/`: the layout and the small pieces the pages share.
- `static/global.css`: the whole look. Override the custom properties at the top to restyle it.
- Everything else under `routes/` and `machines/` is a one-line mount of `@indiepub/stator`: the admin at `/admin`, Micropub, IndieAuth, webmentions, feeds, subscriptions, syndication and the Open Graph cards.

## Local development

You need Node 24 and pnpm. `@indiepub/stator` installs from `registry.indiepub.dev` with your license token:

```bash
export INDIEPUB_NPM_TOKEN=…   # from indiepub.dev/account
pnpm install
cp .env.example .env.local    # set SITE_OWNER_EMAIL
pnpm seed                     # optional: demo posts from ../demo-content/minimal
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
