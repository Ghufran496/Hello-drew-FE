import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';

export const voices = pgTable('voices', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  type: varchar('type', { length: 255 }),
  traits: varchar('traits', { length: 255 }),
  gender: varchar('gender', { length: 255 }),
  override_agent_id: varchar('override_agent_id', { length: 255 }),
  description: text('description'),
  recording_url: text('recording_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
