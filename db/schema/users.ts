import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { packages } from "./packages";

export const users = pgTable("users", {
  id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
  name: varchar().notNull(),
  email: varchar().unique().notNull(),
  password: varchar(),
  phone: varchar(),
  image: varchar(),
  brokerage_name: varchar(),
  personal_website: varchar(),
  team_website: varchar(),
  monthly_leads: varchar(),
  customer_id: varchar(),
  role: varchar().default("user"),
  unavailable_hours: jsonb(),
  drew_tone: varchar(),
  drew_voice_accent: jsonb(),
  drew_name: varchar(),
  created_at: timestamp().defaultNow(),
  is_active: boolean().default(false),
  is_verified: boolean().default(false),
  package_id: integer("package_id").references(() => packages.id),
});
