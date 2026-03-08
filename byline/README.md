# @indiepub/theme-byline

A writer-focused [IndiePub](https://indiepub.dev) theme with a built-in `/write` dashboard for managing posts, drafts, and redirects. Includes a TipTap rich text editor with markdown support.

## Pages

- `/` — home feed
- `/about` — about/profile page
- `/notes`, `/articles` — filtered archives
- `/posts/[slug]` — canonical post page
- `/subscribe` — email subscription form
- `/write` — writing dashboard (subscriber count, published/draft stats, recent posts)
- `/write/[id]` — post editor
- `/write/redirects` — redirect management UI

## Features

- Writing dashboard with subscriber count, published/draft stats, and recent posts table
- TipTap rich text editor with markdown support
- Draft/published status tracking
- Redirect management UI
- Minimal public-facing design — content-first

## Quick start

Scaffold a new project with `create-indiepub`:

```bash
npm create indiepub@latest
```

Select **Byline** when prompted for a template.

## Local development

### 1. Create Cloudflare resources

You'll need a [Cloudflare](https://dash.cloudflare.com) account with the following resources. Create them with the Wrangler CLI:

```bash
# D1 database (SQLite)
npx wrangler d1 create my-site-db

# R2 bucket (media/file storage)
npx wrangler r2 bucket create my-site-bucket
```

Copy the returned IDs into `wrangler.toml`:

- `database_id` under `[[d1_databases]]`
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

Optional variables (depending on features enabled during scaffolding):

| Variable | Description |
|---|---|
| `BSKY_APP_PASSWORD` | Bluesky app password (for cross-posting) |
| `MASTODON_ACCESS_TOKEN` | Mastodon access token (for cross-posting) |
| `ACTIVITYPUB_PRIVATE_KEY` | RSA private key PEM (for ActivityPub HTTP Signatures) |
| `ACTIVITYPUB_PUBLIC_KEY` | RSA public key PEM (served in Actor document) |
| `RESEND_API_KEY` | [Resend](https://resend.com) API key (for email subscriptions) |
| `RESEND_FROM_EMAIL` | Newsletter sender address, e.g. `You <newsletter@yourdomain.com>` |

### 3. Install and run

```bash
npm install
npm run db:migrate
npm run dev
```

Visit `http://localhost:4321/admin/onboarding` to finish setup, then go to `/write` to start writing.

## Deploy to production

IndiePub sites deploy to [Cloudflare Pages](https://pages.cloudflare.com).

### Manual deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=my-site
```

### GitHub Actions (CI/CD)

If you enabled GitHub Actions during scaffolding, a workflow is generated at `.github/workflows/deploy.yml`. Add these repository secrets:

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with **Pages:Edit** permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `INDIEPUB_TOKEN` | Same admin token as `.dev.vars` |
| `NPM_TOKEN` | Your IndiePub license token |

Add any optional secrets (`BSKY_APP_PASSWORD`, `MASTODON_ACCESS_TOKEN`, etc.) that your site uses. Set these as [Cloudflare Pages environment variables](https://developers.cloudflare.com/pages/configuration/environment-variables/) so they're available at runtime.

Pushes to `main` will automatically build and deploy.
