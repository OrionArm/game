import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

export const leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull(), // Ссылка на игрока
  score: integer('score').notNull().default(0),
  rank: integer('rank').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const playerStats = pgTable('player_stats', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull(), // Ссылка на игрока
  totalKills: integer('total_kills').notNull().default(0),
  totalDeaths: integer('total_deaths').notNull().default(0),
  totalGoldEarned: integer('total_gold_earned').notNull().default(0),
  totalGoldSpent: integer('total_gold_spent').notNull().default(0),
  totalDistanceTraveled: integer('total_distance_traveled').notNull().default(0),
  totalEncountersCompleted: integer('total_encounters_completed').notNull().default(0),
  totalPlayTime: integer('total_play_time').notNull().default(0), // в минутах
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type NewLeaderboardEntry = typeof leaderboard.$inferInsert;
export type PlayerStats = typeof playerStats.$inferSelect;
export type NewPlayerStats = typeof playerStats.$inferInsert;
