import { pgTable, serial, integer, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    message: text("message"),
    type: varchar("type", { length: 50 }), // e.g., reminder, usage, update
    is_read: boolean("is_read").default(false),
    created_at: timestamp("created_at").defaultNow()
});