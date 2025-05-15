CREATE TYPE "public"."message_type" AS ENUM('CALL', 'TEXT', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."send_by" AS ENUM('assistant', 'user');--> statement-breakpoint
CREATE TABLE "lead_conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"lead_id" integer,
	"message_type" "message_type" NOT NULL,
	"message_text" text,
	"send_by" "send_by" NOT NULL,
	"status" varchar,
	"details" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "docusign_auth_states" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_docusign_credentials" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lead_conversation" ADD CONSTRAINT "lead_conversation_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_conversation" ADD CONSTRAINT "lead_conversation_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;