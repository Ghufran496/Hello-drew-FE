import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const usageLimits = pgTable("usage_limits", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    callsLimit: integer("calls_limit").default(0),
    textsLimit: integer("texts_limit").default(0), 
    emailsLimit: integer("emails_limit").default(0),
    callsUsed: integer("calls_used").default(0),
    textsUsed: integer("texts_used").default(0),
    emailsUsed: integer("emails_used").default(0),
    createdAt: timestamp("created_at").defaultNow()
});