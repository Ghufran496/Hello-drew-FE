import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const integrationStatus = pgTable('integration_status', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    platformName: varchar('platform_name', { length: 100 }),
    status: varchar('status', { length: 50 }), // e.g., active, inactive, disconnected
    lastChecked: timestamp('last_checked').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});