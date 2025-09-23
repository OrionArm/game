import { pgTable, serial, integer, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';

export const shopItems = pgTable('shop_items', {
  id: serial('id').primaryKey(),
  itemId: integer('item_id').notNull(), // Ссылка на предмет
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(-1), // -1 означает неограниченный запас
  isAvailable: boolean('is_available').default(true),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0.00'), // Скидка в процентах
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull(), // Ссылка на игрока
  itemId: integer('item_id').notNull(), // Ссылка на предмет
  quantity: integer('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
});

export type ShopItem = typeof shopItems.$inferSelect;
export type NewShopItem = typeof shopItems.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
