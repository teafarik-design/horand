FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install all deps
RUN npm install

# Copy source
COPY . .

# Ensure public dir exists
RUN mkdir -p public

# Build Next.js (requires output: standalone in next.config.js)
RUN npm run build

# Verify standalone output
RUN test -f .next/standalone/server.js && echo "✅ standalone/server.js found" || (echo "❌ standalone not found, check next.config.js output: standalone" && exit 1)

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
