import { InferSelectModel, relations } from 'drizzle-orm';
import { inet, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { shortUrlsTable } from './short_url.schema';

export const urlVisitsTable = pgTable('url_visits', {
  id: serial('id').primaryKey(),
  alias: varchar('alias', { length: 20 })
    .notNull()
    .references(() => shortUrlsTable.alias, { onDelete: 'cascade' }),
  ipAddress: inet('ip_address').notNull(),
  visitedAt: timestamp('visited_at').defaultNow(),
});

export type UrlVisits = InferSelectModel<typeof urlVisitsTable>;

export const urlVisitsTableRelations = relations(urlVisitsTable, ({ one }) => ({
  shortUrl: one(shortUrlsTable, {
    fields: [urlVisitsTable.alias],
    references: [shortUrlsTable.alias],
  }),
}));
