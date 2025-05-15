import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const teamActivity = pgTable('team_activity', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }), // Logs individual user activity
  actionType: varchar('action_type', { length: 50 }), // e.g., "call", "email", "task_completed"
  // details: jsonb('details'), // Additional details (e.g., {"lead_id": 123, "duration": "5 minutes"})
  details: varchar('details', { length: 255 }), // Najeeb's instruction to change the datatype and its length
  timestamp: timestamp('timestamp').defaultNow(),
});
