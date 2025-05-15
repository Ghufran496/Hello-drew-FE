import { pgTable, serial, integer, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const leads = pgTable("leads", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id),
    external_id: varchar("external_id", { length: 255 }),
    source: varchar("source", { length: 50 }),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    status: varchar("status", { length: 50 }),
    drip_campaign: varchar("drip_campaign", { length: 255 }),
    drip_campaign_status: varchar("drip_campaign_status", { length: 50 }),
    lead_details: jsonb("lead_details"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow()
});