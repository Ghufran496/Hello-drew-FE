import { pgTable, serial, integer, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const appointments = pgTable('appointments', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    appointmentTime: timestamp('appointment_time'),
    status: varchar('status', { length: 50 }), // e.g., scheduled, completed, canceled
    participantDetails: jsonb('participant_details'), // Details of participants
    createdAt: timestamp('created_at').defaultNow()
});