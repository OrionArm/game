import { pgTable, serial, varchar, integer, timestamp, boolean, text, json } from 'drizzle-orm/pg-core';

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  health: integer('health').notNull().default(100),
  maxHealth: integer('max_health').notNull().default(100),
  steps: integer('steps').notNull().default(0),
  gold: integer('gold').notNull().default(0),
  cristal: integer('cristal').notNull().default(0),
  position: integer('position').notNull().default(0),
  inventory: json('inventory').default({}), // Упрощенный инвентарь как JSON объект
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});



export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
