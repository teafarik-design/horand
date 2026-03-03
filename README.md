# HORAND Partnership 🤝

> Web app for creating co-ownership partnership agreements. Manage partners, revenue distribution rules, and export legally-structured PDF agreements.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript + Passport JWT |
| ORM | Prisma |
| Database | PostgreSQL |
| PDF | Puppeteer (HTML→PDF) |
| Auth | JWT (email + password) |
| Containerization | Docker + docker-compose |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL)
- npm or yarn

### 1. Clone and install

```bash
git clone <repo>
cd horand

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Start PostgreSQL

```bash
cd ..
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env if needed (defaults work with docker-compose.dev.yml)
```

### 4. Run migrations and seed

```bash
# In /backend
npx prisma migrate dev --name init
npm run prisma:generate
npm run prisma:seed
```

### 5. Start backend

```bash
npm run start:dev
# API running at http://localhost:4000
# Swagger docs: http://localhost:4000/api/docs
```

### 6. Start frontend

```bash
cd ../frontend
cp .env.example .env.local
npm run dev
# App running at http://localhost:3000
```

### Test credentials

```
Email: demo@horand.com
Password: password123
```

---

## 🐳 Production Deployment (Docker)

### Build and run everything

```bash
docker-compose up --build -d
```

This starts:
- PostgreSQL on port 5432
- Backend API on port 4000
- Frontend on port 3000

Migrations run automatically on backend startup.

### DigitalOcean Droplet

```bash
# On your Droplet (Ubuntu 22.04):
apt update && apt install -y docker.io docker-compose-plugin

git clone <repo>
cd horand

# Edit docker-compose.yml — change JWT_SECRET and optionally FRONTEND_URL
nano docker-compose.yml

docker compose up --build -d

# Seed demo data (first time only):
docker compose exec backend npx ts-node prisma/seed.ts
```

Access at `http://<droplet-ip>:3000`

---

## 📁 Project Structure

```
horand/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # JWT auth, login, register
│   │   ├── companies/          # Company/project CRUD
│   │   ├── partners/           # Partner CRUD + photo upload
│   │   ├── revenue-rules/      # Revenue distribution rules
│   │   ├── agreements/         # Agreement generation + PDF export
│   │   ├── pdf/                # PDF generation service (Puppeteer)
│   │   ├── prisma/             # Prisma service
│   │   └── tests/              # Unit tests
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema
│   │   └── seed.ts             # Demo data seed
│   ├── uploads/                # Uploaded files (partner photos, PDFs)
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/                   # Next.js 14 App
│   ├── app/
│   │   ├── auth/               # Login + Register pages
│   │   ├── dashboard/          # Main dashboard
│   │   └── company/[id]/       # Company detail pages
│   │       ├── page.tsx        # Overview
│   │       ├── partners/       # Partner management
│   │       ├── revenue/        # Revenue rules
│   │       └── agreement/      # Agreement + PDF export
│   ├── components/
│   │   ├── layout/             # Navbar, AuthGuard
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # API client, auth utils, types
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml          # Production
├── docker-compose.dev.yml      # Local dev (DB only)
└── README.md
```

---

## 🧪 Tests

```bash
cd backend
npm test                  # Run all tests
npm run test:cov          # With coverage
```

Tests cover:
- Auth: register validation, login, JWT
- Partners: share validation (no > 100%)
- Revenue rules: shares must sum to 100%

---

## 🔑 API Overview

All protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/companies | List companies |
| POST | /api/companies | Create company |
| GET | /api/companies/:id | Get company |
| PATCH | /api/companies/:id | Update company |
| DELETE | /api/companies/:id | Delete company |
| GET | /api/companies/:id/partners | List partners |
| POST | /api/companies/:id/partners | Add partner (multipart/form-data) |
| PATCH | /api/companies/:id/partners/:pid | Update partner |
| DELETE | /api/companies/:id/partners/:pid | Delete partner |
| GET | /api/companies/:id/revenue-rules | List rules |
| POST | /api/companies/:id/revenue-rules | Create rule |
| PATCH | /api/companies/:id/revenue-rules/:rid | Update rule |
| DELETE | /api/companies/:id/revenue-rules/:rid | Delete rule |
| POST | /api/companies/:id/agreements/generate | Generate agreement |
| GET | /api/companies/:id/agreements | List agreements |
| POST | /api/companies/:id/agreements/:aid/export-pdf | Export PDF |

Swagger UI: `http://localhost:4000/api/docs`

---

## 🌐 Language

The app supports **Ukrainian** (primary) and **English** (API/code). Interface language is Ukrainian.

---

## 📸 DO Spaces (Optional — file storage)

To store uploads in DigitalOcean Spaces instead of local `/uploads`:

1. Install `@aws-sdk/client-s3` in the backend
2. Update `MulterModule` in `partners.module.ts` and `companies.module.ts` to use S3 storage
3. Add env vars: `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_ENDPOINT`, `DO_SPACES_BUCKET`

---

## License

MIT
