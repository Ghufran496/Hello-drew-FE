import { pgTable, serial, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    priority: varchar('priority', { length: 50 }), // e.g., low, medium, high
    status: varchar('status', { length: 50 }).default('pending'), // e.g., pending, completed
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});