# 🎮 TH Game Backend API

Полнофункциональный бэкенд для игры с REST API эндпоинтами.

## 📋 Установка зависимостей

```bash
cd backend
npm install
# или
pnpm install
```

## 🚀 Запуск

```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## 📡 API Эндпоинты

### 🔐 Аутентификация

#### POST /api/auth/register
Регистрация нового пользователя
```json
{
  "username": "player1",
  "email": "player@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
Вход в систему
```json
{
  "username": "player1",
  "password": "password123"
}
```

### 🌍 Мир

#### GET /api/world/state
Получить состояние мира
```json
{
  "currentDay": 1,
  "activeEncounters": [],
  "worldEvents": [],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/world/encounters/:id
Получить информацию об энкаунтере
```json
{
  "id": 1,
  "name": "Гоблин",
  "description": "Слабый монстр",
  "type": "monster",
  "difficulty": 2,
  "rewards": {"gold": 10, "exp": 5},
  "requirements": {"level": 1}
}
```

#### POST /api/world/encounters/:id/resolve
Разрешить энкаунтер
```json
{
  "resolution": "success",
  "choices": {}
}
```

### 👤 Игрок

#### GET /api/player/state
Получить состояние игрока
```json
{
  "id": 1,
  "name": "Player_1",
  "level": 1,
  "experience": 0,
  "health": 100,
  "maxHealth": 100,
  "mana": 50,
  "maxMana": 50,
  "strength": 10,
  "agility": 10,
  "intelligence": 10,
  "gold": 100,
  "positionX": 0,
  "positionY": 0,
  "isAlive": true,
  "lastActive": "2024-01-01T00:00:00.000Z"
}
```

#### POST /api/player/move
Переместить игрока
```json
{
  "x": 1,
  "y": 0
}
```

#### GET /api/player/inventory
Получить инвентарь игрока
```json
{
  "items": [
    {
      "id": 1,
      "itemId": 1,
      "quantity": 1,
      "equipped": false,
      "item": {
        "id": 1,
        "name": "Меч",
        "description": "Простой меч",
        "type": "weapon",
        "rarity": "common",
        "stats": {"damage": 10},
        "value": 50
      }
    }
  ],
  "totalSlots": 50,
  "usedSlots": 1
}
```

### 🛒 Магазин

#### GET /api/shop
Получить товары магазина
```json
{
  "items": [
    {
      "id": 1,
      "itemId": 1,
      "price": "50.00",
      "stock": 10,
      "isAvailable": true,
      "discount": "0.00",
      "item": {
        "id": 1,
        "name": "Меч",
        "description": "Простой меч",
        "type": "weapon",
        "rarity": "common",
        "stats": {"damage": 10},
        "value": 50,
        "stackable": false
      }
    }
  ],
  "totalItems": 1
}
```

#### POST /api/shop/purchase
Купить предмет
```json
{
  "itemId": 1,
  "quantity": 1
}
```

### 🏆 Награды

#### GET /api/rewards
Получить доступные награды
```json
{
  "rewards": [
    {
      "id": 1,
      "name": "Ежедневная награда",
      "description": "Получите 10 золота",
      "type": "daily",
      "requirements": {"level": 1},
      "rewards": {"gold": 10},
      "isActive": true,
      "expiresAt": null,
      "isClaimed": false,
      "canClaim": true
    }
  ],
  "totalRewards": 1
}
```

#### POST /api/rewards/claim
Забрать награду
```json
{
  "rewardId": 1
}
```

#### GET /api/rewards/achievements
Получить достижения
```json
{
  "achievements": [
    {
      "id": 1,
      "name": "Первый шаг",
      "description": "Достигните 1 уровня",
      "category": "leveling",
      "requirements": {"level": 1},
      "rewards": {"gold": 50},
      "isHidden": false,
      "isUnlocked": true,
      "progress": {"level": {"current": 1, "required": 1, "percentage": 100}},
      "unlockedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalAchievements": 1,
  "unlockedCount": 1
}
```

### 🏅 Рейтинг

#### GET /api/leaderboard
Получить общий рейтинг
```json
{
  "entries": [
    {
      "rank": 1,
      "playerId": 1,
      "playerName": "Player_1",
      "score": 1000,
      "level": 5,
      "category": "overall"
    }
  ],
  "totalPlayers": 1,
  "category": "overall",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/leaderboard/my-rank
Получить позицию игрока в рейтинге
```json
{
  "playerId": 1,
  "playerName": "Player_1",
  "rank": 1,
  "score": 1000,
  "level": 5,
  "category": "overall",
  "totalPlayers": 1
}
```

#### GET /api/leaderboard/my-stats
Получить статистику игрока
```json
{
  "totalKills": 10,
  "totalDeaths": 2,
  "totalGoldEarned": 500,
  "totalGoldSpent": 200,
  "totalDistanceTraveled": 1000,
  "totalEncountersCompleted": 15,
  "totalPlayTime": 120,
  "killDeathRatio": 5.0
}
```

## 🗄️ База данных

Проект использует PostgreSQL с Drizzle ORM. Схемы базы данных включают:

- **users** - пользователи
- **user_sessions** - сессии пользователей
- **players** - игроки
- **player_inventory** - инвентарь игроков
- **player_movements** - перемещения игроков
- **items** - предметы
- **encounters** - энкаунтеры
- **world_state** - состояние мира
- **encounter_resolutions** - разрешения энкаунтеров
- **shop_items** - товары магазина
- **purchases** - покупки
- **rewards** - награды
- **player_rewards** - полученные награды
- **achievements** - достижения
- **player_achievements** - достижения игроков
- **leaderboard** - рейтинг
- **player_stats** - статистика игроков

## 🔧 Команды базы данных

```bash
# Генерация миграций
npm run db:generate

# Применение миграций
npm run db:migrate

# Открыть Drizzle Studio
npm run db:studio
```

## 📝 Примечания

- Все эндпоинты требуют аутентификации (кроме регистрации и входа)
- Временные заглушки для userId заменены на реальную аутентификацию
- Добавлена валидация входных данных с помощью class-validator
- Используется bcrypt для хеширования паролей
- Токены сессий имеют срок действия 7 дней

## 🚧 TODO

- [ ] Добавить middleware для аутентификации
- [ ] Реализовать реальную логику разрешения энкаунтеров
- [ ] Добавить систему событий мира
- [ ] Реализовать систему достижений
- [ ] Добавить кэширование для рейтинга
- [ ] Добавить логирование и мониторинг
