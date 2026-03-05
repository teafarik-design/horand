FROM node:20-alpine AS builder
WORKDIR /app

ARG CACHEBUST=3

RUN apk add --no-cache openssl

COPY package.json ./

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true

RUN npm install

COPY . .

RUN npx prisma generate

RUN rm -rf dist tsconfig.tsbuildinfo && npx nest build && ls -la dist/

RUN test -f dist/main.js && echo "✅ Build OK" || (echo "❌ FAILED" && ls -la dist/ && exit 1)

FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache openssl chromium

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

RUN mkdir -p uploads/pdfs uploads/photos

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && echo '=== Starting NestJS ===' && node dist/main.js || (echo '=== dist/main.js failed, trying dist/src/main.js ===' && node dist/src/main.js)"]
