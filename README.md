# HORAND Partnership

Веб-застосунок для управління партнерськими угодами. Дозволяє власникам бізнесу керувати співвласниками компаній, розподілом доходів та генерувати PDF-договори з підписом.

## Технології

**Backend:** NestJS, Prisma ORM, PostgreSQL, JWT, Swagger, Puppeteer  
**Frontend:** Next.js 14, TypeScript, Tailwind CSS, React Hook Form, Zod, Axios

---

## Функціонал

- Реєстрація та авторизація (JWT)
- Управління компаніями та проєктами
- Додавання партнерів з фото та частками
- Правила розподілу доходів (PROJECT / CLIENTS / NET_PROFIT)
- Генерація PDF-договорів з підписом
- Ролі: **Owner** (повний доступ) та **Editor** (редагування партнерів і правил)
- Управління редакторами — власник створює акаунти для співробітників

---

## Локальний запуск

### Вимоги

- Node.js 20+
- PostgreSQL 14+
- npm

### 1. Клонування репозиторію

```bash
git clone https://github.com/teafarik-design/horand.git
cd horand
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Заповни `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/horand"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

```bash
npm install
npx prisma db push
npm run start:dev
```

Backend запуститься на `http://localhost:4000`  
Swagger документація: `http://localhost:4000/api/docs`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
```

Заповни `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

```bash
npm install
npm run dev
```

Frontend запуститься на `http://localhost:3000`

---

## Деплой на Railway

### Структура сервісів

| Сервіс | Тип | Root Directory |
|--------|-----|----------------|
| PostgreSQL | Database | — |
| horand | GitHub repo | `backend` |
| insightful-passion | GitHub repo | `frontend` |

### Backend — змінні середовища

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.up.railway.app
PORT=4000
PUPPETEER_SKIP_DOWNLOAD=true
```

### Frontend — змінні середовища

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

### Налаштування Railway

**Backend сервіс:**
- Builder: `Dockerfile`
- Dockerfile Path: `/backend/Dockerfile`
- Pre-deploy Command: `npx prisma db push --accept-data-loss`
- Healthcheck Path: `/api`
- Healthcheck Timeout: `300`

**Frontend сервіс:**
- Builder: `Dockerfile`
- Dockerfile Path: `/frontend/Dockerfile`
- Healthcheck Path: `/`
- Healthcheck Timeout: `180`

---

## Структура проєкту

```
horand/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Схема БД
│   ├── src/
│   │   ├── auth/                # JWT авторизація
│   │   ├── companies/           # Компанії та проєкти
│   │   ├── partners/            # Партнери
│   │   ├── revenue-rules/       # Правила доходів
│   │   ├── agreements/          # Договори
│   │   ├── editors/             # Управління редакторами
│   │   ├── pdf/                 # Генерація PDF
│   │   └── main.ts
│   └── Dockerfile
└── frontend/
    ├── app/
    │   ├── auth/                # Логін / реєстрація
    │   ├── dashboard/           # Головна сторінка
    │   ├── company/[id]/        # Компанія, партнери, доходи, договір
    │   └── editors/             # Управління редакторами
    ├── components/
    │   ├── layout/              # Navbar, AuthGuard
    │   └── ui/                  # Modal, ProgressBar, PartnerAvatar
    ├── lib/
    │   ├── api.ts               # Axios клієнт та всі API виклики
    │   ├── auth.ts              # JWT утиліти
    │   └── types.ts             # TypeScript типи
    └── Dockerfile
```

---

## Ролі користувачів

| Дія | Owner | Editor |
|-----|-------|--------|
| Створити компанію | ✅ | ❌ |
| Видалити компанію | ✅ | ❌ |
| Редагувати партнерів | ✅ | ✅ |
| Редагувати правила доходів | ✅ | ✅ |
| Генерувати договір | ✅ | ❌ |
| Керувати редакторами | ✅ | ❌ |

---

## API Endpoints

| Метод | Endpoint | Опис |
|-------|----------|------|
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Вхід |
| GET | `/api/auth/me` | Профіль |
| GET/POST | `/api/companies` | Компанії |
| GET/PATCH/DELETE | `/api/companies/:id` | Компанія |
| GET/POST | `/api/companies/:id/partners` | Партнери |
| GET/POST | `/api/companies/:id/revenue-rules` | Правила доходів |
| POST | `/api/companies/:id/agreements/generate` | Генерація договору |
| POST | `/api/companies/:id/agreements/:id/export-pdf` | Експорт PDF |
| GET/POST/DELETE | `/api/editors` | Редактори |

Повна документація: `/api/docs` (Swagger UI)

---

## Ліцензія

MIT
