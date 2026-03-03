FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public 2>/dev/null || true
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./next.config.js
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
