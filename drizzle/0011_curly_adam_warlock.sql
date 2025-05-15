ALTER TABLE "public"."lead_conversation" ALTER COLUMN "message_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."message_type";--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('Initial-Outreach', 'Follow-Up', 'Qualification', 'Appointment', 'Reminder', 'Post-Meeting');--> statement-breakpoint
ALTER TABLE "public"."lead_conversation" ALTER COLUMN "message_type" SET DATA TYPE "public"."message_type" USING "message_type"::"public"."message_type";