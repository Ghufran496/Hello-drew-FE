import { pgTable, serial, integer, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const integrations = pgTable('integrations', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    platformName: varchar('platform_name', { length: 100 }),
    credentials: jsonb(),
    createdAt: timestamp('created_at').defaultNow(),
    
});