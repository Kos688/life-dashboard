# Life Dashboard

Production-ready SaaS для управления жизнью: задачи, цели, привычки, финансы и заметки в одном аккаунте.

## Стек

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **База данных:** SQLite + Prisma ORM
- **Авторизация:** JWT (httpOnly cookie)
- **Состояние:** Zustand
- **Графики:** Recharts
- **Уведомления:** Sonner (toast)

## Структура проекта

```
life-dashboard/
├── prisma/
│   └── schema.prisma          # Модели: User, Task, Goal, Habit, HabitLog, Finance, Note
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # register, login, logout, me
│   │   │   ├── dashboard/     # stats для главной
│   │   ├── analytics/     # данные для страницы Аналитика
│   │   ├── activity/      # лента действий пользователя
│   │   ├── settings/      # PATCH profile, DELETE account
│   │   ├── tasks/
│   │   ├── goals/
│   │   ├── habits/
│   │   ├── finance/
│   │   └── notes/
│   │   ├── dashboard/          # Главная, задачи, цели, привычки, финансы, заметки, аналитика, история, настройки
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Лендинг
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Button, Card, Input, Skeleton, EmptyState
│   │   ├── layout/            # Sidebar, DashboardShell (mobile menu)
│   │   ├── dashboard/         # DashboardView, DashboardClient
│   │   ├── tasks/
│   │   ├── goals/
│   │   ├── habits/
│   │   ├── finance/
│   │   ├── notes/
│   │   └── ThemeProvider.tsx
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── auth.ts            # JWT create/verify, cookies
│   │   ├── api.ts             # apiError, apiSuccess
│   │   ├── api-client.ts      # apiFetch, ApiResult (client)
│   │   ├── validation.ts      # sanitize, validate inputs
│   │   ├── constants.ts      # enums, categories
│   │   ├── logger.ts         # logger
│   │   ├── env.ts            # validateEnv
│   │   ├── activity.ts       # logActivity
│   │   └── utils.ts
│   ├── stores/
│   │   ├── authStore.ts       # Zustand: user, fetchUser, logout
│   │   └── themeStore.ts      # light/dark/system
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts          # Защита /dashboard, редирект по JWT
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Установка зависимостей

```bash
cd life-dashboard
npm install
```

## Запуск локально

1. **Переменные окружения**

   Скопируйте пример и при необходимости отредактируйте:

   ```bash
   cp .env.example .env
   ```

   В `.env` должны быть:

   - `DATABASE_URL="file:./dev.db"` — путь к SQLite (относительно папки `prisma/`)
   - `JWT_SECRET` — секрет для подписи JWT (в продакшене обязательно свой)

2. **Создание БД и миграции**

   ```bash
   npx prisma migrate dev --name init
   ```

3. **Запуск приложения**

   ```bash
   npm run dev
   ```

   Откройте [http://localhost:3000](http://localhost:3000).

## Тестовый пользователь

После первого запуска можно зарегистрировать пользователя через **Регистрация** на главной или через API.

Для быстрого теста можно создать пользователя через Prisma Studio или seed-скрипт.

**Тестовый пользователь**

1. **Через форму регистрации:** откройте [http://localhost:3000/register](http://localhost:3000/register) и создайте аккаунт.

2. **Через seed (после миграций):**
   ```bash
   npx prisma db seed
   ```
   Будет создан пользователь:
   - **Email:** `test@example.com`
   - **Пароль:** `test123`
   - **Имя:** Тест

## Сборка для production

```bash
npm run build
npm run start
```

Перед деплоем задайте `DATABASE_URL` и `JWT_SECRET` в окружении и выполните миграции:

```bash
npx prisma migrate deploy
```

**Важно:** В схеме есть модель `ActivityLog`. Если вы обновляли проект, создайте миграцию:

```bash
npx prisma migrate dev --name add_activity_log
```

### Vercel

- Подключите репозиторий к Vercel, задайте `DATABASE_URL` и `JWT_SECRET`.
- SQLite с файлом на Vercel не персистится; для production используйте Vercel Postgres или внешнюю БД и смените `provider` в `schema.prisma` на `postgresql`.

### Docker

```bash
docker build -t life-dashboard .
docker run -p 3000:3000 -e JWT_SECRET=your-secret -v /path/to/data:/app/data -e DATABASE_URL="file:/app/data/dev.db" life-dashboard
```

Для персистентности БД монтируйте volume и задайте `DATABASE_URL` с путём внутри контейнера.

## Функции

- **Аутентификация:** регистрация, вход, выход, защита страниц по JWT
- **Dashboard:** приветствие, сводка по задачам/целям/привычкам/финансам, графики (Recharts)
- **Задачи:** создание, удаление, отметка выполнения, дедлайн, приоритет
- **Цели:** название, дедлайн, прогресс %, статус (активна/завершена/на паузе)
- **Привычки:** ежедневные отметки, streak, календарь активности
- **Финансы:** доход/расход, категории, график трат
- **Заметки:** текст, дата, редактирование
- **Тёмная тема:** переключатель в сайдбаре (light/dark/system)
- **Toast-уведомления:** Sonner
- **Skeleton и empty states:** на списках и дашборде
