import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  jsonb,
  text,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }),
  voiceId: varchar('voiceId', { length: 255 }),
  welcomeMessage: text('welcomeMessage'),
  tone: jsonb('tone').default({
    name: 'friendly-conversational', 
    description: 'Warm, approachable, and casual to build rapport.',
  }),
  prompt: text('prompt'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
