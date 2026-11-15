# syntax=docker/dockerfile:1
FROM node:24-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# The registry token arrives as a build secret, never a layer:
#   fly deploy --build-secret INDIEPUB_NPM_TOKEN="$INDIEPUB_NPM_TOKEN"
RUN --mount=type=secret,id=INDIEPUB_NPM_TOKEN,env=INDIEPUB_NPM_TOKEN \
  CI=true pnpm install --frozen-lockfile

FROM base AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN if [ -f .deployed-manifest.json ]; then pnpm build --previous .deployed-manifest.json; else pnpm build; fi

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["pnpm", "start"]
