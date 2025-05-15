import {
    integer,
    pgTable,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { packages } from "./packages";

export const payments = pgTable("payments", {
    id: integer().primaryKey().notNull().generatedAlwaysAsIdentity(),
    user_id: integer().references(() => users.id).notNull(),
    package_id: integer().references(() => packages.id).notNull(),
    payment_status: varchar().notNull(),
    created_at: timestamp().defaultNow(),
});