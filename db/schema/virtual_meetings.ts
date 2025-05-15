import { pgTable, serial, integer, timestamp, varchar, jsonb, text } from 'drizzle-orm/pg-core';
import { users } from './users';

export const virtualMeetings = pgTable('virtual_meetings', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    meetingTime: timestamp('meeting_time'),
    status: varchar('status', { length: 50 }), // e.g., scheduled, completed, canceled
    participants: jsonb('participants'), // Array of participant details
    agenda: text('agenda'), // Meeting agenda
    summary: text('summary'), // Post-meeting summary
    transcription: jsonb('transcription'), // Key discussion points or transcription data
    createdAt: timestamp('created_at').defaultNow()
});