import { pgTable, serial, integer, varchar, jsonb, timestamp, text } from 'drizzle-orm/pg-core';
import { users } from './users';


export const user_drew_communications = pgTable('user_drew_communications', {
    id: serial('id').primaryKey(),
    user_id: integer('user_id').references(() => users.id),  // The agent initiating the communication
    drew_id: varchar('drew_id', { length: 50 }),  // Drew ID
    type: varchar('type', { length: 20 }),                   // Communication type (SMS, Call, Email) 
    status: varchar('status', { length: 20 }),               // Status (e.g., Sent, Delivered, Failed)
    details: jsonb('details'),                               // Additional details (e.g., message content, call duration)
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow()
});