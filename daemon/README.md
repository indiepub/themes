# @indiepub/theme-default

The reference [IndiePub](https://indiepub.dev) theme — a full-featured IndieWeb site with all post types, a built-in note composer, and public-facing pages for notes, articles, photos, and bookmarks.

## Pages

- `/` — home feed (all post types)
- `/about` — about/profile page
- `/now` — "now" page
- `/notes`, `/articles`, `/bookmarks`, `/photos` — filtered archives
- `/posts/[slug]` — canonical post page (all types)
- `/tags/[tag]` — posts filtered by tag
- `/subscribe` — email subscription form
- `/login` — admin login

## Features

- Note composer with markdown toolbar and post type selector (note, article, photo, bookmark, reply, like, repost)
- Sidebar with h-card profile, social links, tag cloud, and RSS feed links
- Light/dark theme toggle
- Separate card layouts per post type
- Mobile-responsive with slide-out navigation

## Quick start

Scaffold a new project with `create-indiepub`:

```bash
npm create indiepub@latest
```

Select **Default** when prompted for a template.

## Local development

### 1. Create Cloudflare resources

You'll need a [Cloudflare](https://dash.cloudflare.com) account with the following resources. Create them with the Wrangler CLI:

```bash
# D1 database (SQLite)
npx wrangler d1 create my-site-db

# R2 bucket (media/file storage)
npx wrangler r2 bucket create my-site-bucket
```

Copy the returned IDs into `wrangler.toml` and `wrangler.scheduler.toml`:

- `database_id` under `[[d1_databases]]` (in both files)
- `bucket_name` under `[[r2_buckets]]` (should already match)

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp .dev.vars.example .dev.vars
```

Required variables:

| Variable | Description |
|---|---|
| `INDIEPUB_NPM_TOKEN` | Your IndiePub license token (from [indiepub.dev/account](https://indiepub.dev/account)) |
| `INDIEPUB_TOKEN` | A secret token for Micropub and admin authentication — choose something random and secure |

Optional variables (add as needed):

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | [Resend](https://resend.com) API key (for email subscriptions) |
| `RESEND_FROM_EMAIL` | Newsletter sender address, e.g. `You <newsletter@yourdomain.com>` |

Connect Bluesky and Mastodon accounts from `/admin/accounts` after setup — no env vars needed.

### 3. Install and run

```bash
npm install
npm run db:migrate
npm run dev
```

Visit `http://localhost:4321/admin/onboarding` to finish setup.

## Deploy to production

IndiePub sites deploy to [Cloudflare Pages](https://pages.cloudflare.com).

### Manual deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=my-site
```

### Deploy the backfeed scheduler

If you've connected Bluesky or Mastodon accounts, deploy the scheduler to sync interactions:

```bash
npx wrangler deploy -c wrangler.scheduler.toml
```

Make sure `wrangler.scheduler.toml` has the same `database_id` as your site's `wrangler.toml`. See [Backfeed](https://indiepub.dev/concepts/backfeed/) for details.

### GitHub Actions (CI/CD)

If you enabled GitHub Actions during scaffolding, a workflow is generated at `.github/workflows/deploy.yml` that deploys both the site and the scheduler. Add these repository secrets:

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with **Workers deploy** permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `NPM_TOKEN` | Your IndiePub license token |

Add any optional secrets your site uses (e.g. `RESEND_API_KEY` for email subscriptions). Set these as [Cloudflare environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/) so they're available at runtime.

Pushes to `main` will automatically build and deploy.
