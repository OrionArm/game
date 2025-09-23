import { pgTable, serial, varchar, integer, timestamp, boolean, text, json } from 'drizzle-orm/pg-core';

export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'daily', 'weekly', 'achievement', 'event'
  requirements: json('requirements'), // JSON с требованиями для получения
  rewards: json('rewards'), // JSON с наградами
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'), // Время истечения награды
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const playerRewards = pgTable('player_rewards', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull(), // Ссылка на игрока
  rewardId: integer('reward_id').notNull().references(() => rewards.id),
  claimedAt: timestamp('claimed_at').defaultNow().notNull(),
  isClaimed: boolean('is_claimed').default(false),
});

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // 'combat', 'exploration', 'social', 'economy'
  requirements: json('requirements'), // JSON с требованиями
  rewards: json('rewards'), // JSON с наградами
  isHidden: boolean('is_hidden').default(false), // Скрытое достижение
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const playerAchievements = pgTable('player_achievements', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull(), // Ссылка на игрока
  achievementId: integer('achievement_id').notNull().references(() => achievements.id),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
  progress: json('progress'), // JSON с прогрессом
});

export type Reward = typeof rewards.$inferSelect;
export type NewReward = typeof rewards.$inferInsert;
export type PlayerReward = typeof playerRewards.$inferSelect;
export type NewPlayerReward = typeof playerRewards.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type PlayerAchievement = typeof playerAchievements.$inferSelect;
export type NewPlayerAchievement = typeof playerAchievements.$inferInsert;
