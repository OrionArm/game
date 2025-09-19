# -------------------- Base --------------------
FROM node:24.2.0 AS base
WORKDIR /app

# Установка pnpm и настройка
RUN corepack enable && corepack prepare pnpm@latest --activate

# Копирование только файлов зависимостей для кэширования
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Установка зависимостей
RUN pnpm install --prefer-offline --no-verify-store-integrity

# -------------------- Dev для backend --------------------
FROM base AS backend-dev
COPY backend ./backend
WORKDIR /app/backend
RUN chmod +x ./start-dev.sh
CMD ["sh", "./start-dev.sh"]

# -------------------- Prod для backend --------------------
FROM base AS backend-prod
COPY backend ./backend
WORKDIR /app/backend
RUN pnpm install --prefer-offline --no-verify-store-integrity
RUN pnpm run build
CMD ["sh", "./start.sh"]

# -------------------- Dev для frontend --------------------
FROM base AS frontend
COPY frontend ./frontend
WORKDIR /app/frontend
CMD ["pnpm", "run", "dev"]

# -------------------- Prod для frontend (vite build + nginx) --------------------
FROM base AS frontend-build
COPY frontend ./frontend
WORKDIR /app/frontend
RUN pnpm install --prefer-offline --no-verify-store-integrity
RUN pnpm run build 

# Финальный nginx образ
FROM nginx:alpine AS frontend-prod
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80