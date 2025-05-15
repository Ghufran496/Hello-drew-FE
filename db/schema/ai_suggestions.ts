import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const aiSuggestions = pgTable('ai_suggestions', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    suggestion: text('suggestion'),
    createdAt: timestamp('created_at').defaultNow()
});