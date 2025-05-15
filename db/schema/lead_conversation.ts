import {
  pgTable,
  serial,
  integer,
  text,
  pgEnum,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { leads } from "./leads";

export const messageTypeEnum = pgEnum("message_type", [
  "Initial-Outreach",
  "Follow-Up", 
  "Qualification",
  "Appointment",
  "Reminder",
  "Post-Meeting"
]);

export const sendByTypeEnum = pgEnum("send_by", ["assistant", "user"]);

export type MessageTypeEnum = typeof messageTypeEnum;

export const leadConversation = pgTable("lead_conversation", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  lead_id: integer("lead_id").references(() => leads.id, {
    onDelete: "cascade",
  }),
  message_type: messageTypeEnum("message_type").notNull(),
  message_text: text("message_text"),
  send_by: sendByTypeEnum("send_by").notNull(),
  status: varchar("status"),
  details: jsonb("details"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
