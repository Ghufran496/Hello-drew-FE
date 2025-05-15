import {
  pgTable,
  serial,
  integer,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { user_drew_communications } from './user_drew_communications';

export const calls = pgTable('calls', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  user_drew_communication_id: integer('communication_id').references(
    () => user_drew_communications.id,
    { onDelete: 'cascade' }
  ),
  callTime: timestamp('call_time').defaultNow(),
  status: varchar('status', { length: 50 }), // e.g., completed, missed, failed
  duration: integer('duration'), // Duration in seconds
  call_id: varchar('call_id', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});
