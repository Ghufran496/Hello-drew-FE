import { sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  timestamp,
  varchar,
  pgEnum,
} from "drizzle-orm/pg-core";

export const packageTypeEnum = pgEnum("type", ["solo", "team"]);

export const packages = pgTable("packages", {
  id: integer("id").primaryKey().notNull().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  type: packageTypeEnum().notNull(),
  calls_limit: integer("calls_limit").default(0),
  texts_limit: integer("texts_limit").default(0),
  emails_limit: integer("emails_limit").default(0),
  price: integer("price").notNull(), // Price in cents
  price_id: varchar("price_id").notNull(), // Stripe price ID
  features: varchar("features")
    .array()
    .default(sql`'{}'::varchar[]`),
  created_at: timestamp("created_at").defaultNow(),
});
