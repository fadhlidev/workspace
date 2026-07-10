# syntax=docker.io/docker/dockerfile:1

FROM oven/bun:1.3-alpine AS base

# Install dependencies only when needed
FROM base AS deps

RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev

WORKDIR /app

# Copy manifest
COPY package.json bun.lock* ./

# Install deps
RUN bun install --frozen-lockfile


# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy environment variables for build time only (to allow Next.js static analysis to pass)
ENV JWT_SECRET=dummy_jwt_secret_for_build_purposes
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV NEXTAUTH_SECRET=dummy_nextauth_secret_for_build_purposes
ENV NEXTAUTH_URL=http://localhost:3000

RUN bun run build


# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Standalone output
COPY --from=builder --chown=nextjs:bunjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bunjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
