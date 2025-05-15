import {
    integer,
    pgTable,
    timestamp,
    varchar,
    jsonb,
    boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const onboarding = pgTable("onboarding", {
    id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
    user_id: integer().references(() => users.id),
    current_step: integer().default(1), // Tracks the current onboarding step
    scheduling_preferences: jsonb(), // Stores scheduling preferences
    communication_tone: varchar(), // Stores user-selected tone
    completed: boolean().default(false), // Marks onboarding as complete
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow()
});