import { sql } from "drizzle-orm";
import {
  timestamp,
  text,
  pgTable,
} from "drizzle-orm/pg-core";

export const demoSchedules = pgTable('demo_schedules', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  scheduledDate: timestamp('scheduled_date').notNull(),
  timeSlot: text('time_slot').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  companyName: text('company_name').notNull(),
  meetingLink: text('meeting_link').notNull(),
  eventId: text('event_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}); 