import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const usageLogs = pgTable('usage_logs', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }), // e.g., call, text, email
    createdAt: timestamp('created_at').defaultNow()
});