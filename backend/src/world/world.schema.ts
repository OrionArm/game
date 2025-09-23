import { pgTable, serial, varchar, integer, timestamp, boolean, text, json } from 'drizzle-orm/pg-core';

export const encounters = pgTable('encounters', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'monster', 'treasure', 'npc', 'trap'
  difficulty: integer('difficulty').notNull().default(1), // 1-10
  rewards: json('rewards'), // JSON с наградами
  requirements: json('requirements'), // JSON с требованиями
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const worldEvents = pgTable('world_events', {
  id: serial('id').primaryKey(),
  eventId: varchar('event_id', { length: 100 }).notNull().unique(), // Уникальный ID события
  position: integer('position').notNull(), // Позиция на карте
  type: varchar('type', { length: 50 }).notNull(), // 'npc', 'monster', 'chest', 'shop'
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  requiresAction: boolean('requires_action').default(true),
  actions: json('actions'), // JSON массив доступных действий
  rewards: json('rewards'), // JSON с возможными наградами
  isResolved: boolean('is_resolved').default(false),
  resolvedBy: integer('resolved_by'), // ID пользователя, который решил событие
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const worldState = pgTable('world_state', {
  id: serial('id').primaryKey(),
  currentDay: integer('current_day').notNull().default(1),
  activeEncounters: json('active_encounters'), // JSON с активными энкаунтерами
  worldEvents: json('world_events'), // JSON с событиями мира
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const encounterResolutions = pgTable('encounter_resolutions', {
  id: serial('id').primaryKey(),
  encounterId: integer('encounter_id').notNull().references(() => encounters.id),
  userId: integer('user_id').notNull(), // Ссылка на пользователя
  resolution: varchar('resolution', { length: 50 }).notNull(), // 'success', 'failure', 'fled'
  rewardsReceived: json('rewards_received'), // JSON с полученными наградами
  resolvedAt: timestamp('resolved_at').defaultNow().notNull(),
});

export type Encounter = typeof encounters.$inferSelect;
export type NewEncounter = typeof encounters.$inferInsert;
export type WorldEvent = typeof worldEvents.$inferSelect;
export type NewWorldEvent = typeof worldEvents.$inferInsert;
export type WorldState = typeof worldState.$inferSelect;
export type NewWorldState = typeof worldState.$inferInsert;
export type EncounterResolution = typeof encounterResolutions.$inferSelect;
export type NewEncounterResolution = typeof encounterResolutions.$inferInsert;
