// db/schema/docusign.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users"; // Import your users schema

export const userDocusignCredentials = pgTable("user_docusign_credentials", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
  .references(() => users.id)
  .unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  accountId: text("account_id").notNull(),
});

// Renamed 'documents' to 'contracts'
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  filename: text("filename").notNull(),
  status: varchar("status", { length: 255 }).notNull(), // e.g., 'uploaded', 'sent', 'completed', 'voided'
  docusignEnvelopeId: text("docusign_envelope_id"),
  contractName: text("contract_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// NEW TABLE: recipients
export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => contracts.id),
  email: text("email").notNull(),
  name: text("name").notNull(),
  docusignRecipientId: text("docusign_recipient_id"),
  clientUserId: text("client_user_id"),
  status: varchar("status", { length: 50 }), // e.g., 'sent', 'delivered', 'completed', 'declined', 'waitingforothers'
  routingOrder: varchar("routing_order", {length: 5}), // String routing order
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const docusignAuthStates = pgTable("docusign_auth_states", {
  id: serial("id").primaryKey(),
  state: text("state").notNull().unique(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});