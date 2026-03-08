# @indiepub/theme-timeline

A feed-based [IndiePub](https://indiepub.dev) theme with a persistent sidebar profile and unified timeline — inspired by social media profiles.

## Pages

- `/` — home timeline (all post types)
- `/about` — about/profile page
- `/notes`, `/articles`, `/bookmarks`, `/photos` — filtered archives
- `/posts/[slug]` — canonical post page
- `/tags/[tag]` — posts filtered by tag
- `/subscribe` — email subscription form

## Features

- Two-column layout: timeline feed + persistent sidebar
- Sidebar with avatar, bio, navigation, RSS feeds, tag cloud, and social links
- Unified feed card for all post types
- Built-in note composer
- Light/dark theme toggle

## Quick start

Scaffold a new project with `create-indiepub`:

```bash
npm create indiepub@latest
```

Select **Timeline** when prompted for a template.

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

Visit `http://localhost:4321/admin/onboarding` to finish setup.

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
