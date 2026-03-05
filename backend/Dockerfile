FROM node:20-alpine AS builder
WORKDIR /app

# OpenSSL required by Prisma on alpine
RUN apk add --no-cache openssl

# Copy package.json (no lock file)
COPY package.json ./

# Set puppeteer env before install so it skips chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Install all deps (including devDeps needed for nest build)
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN rm -rf dist && npx tsc -p tsconfig.json && echo "=== dist contents ===" && ls -la dist/

# Verify build output
RUN test -f dist/main.js && echo "✅ Build OK: dist/main.js exists" || (echo "❌ Build FAILED: dist/main.js not found" && ls -la dist/ 2>/dev/null && exit 1)

# ---- Production image ----
FROM node:20-alpine AS production
WORKDIR /app

# Chromium for Puppeteer PDF generation + OpenSSL for Prisma
RUN apk add --no-cache openssl chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Create upload directories
RUN mkdir -p uploads/pdfs uploads/photos

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main.js"]
