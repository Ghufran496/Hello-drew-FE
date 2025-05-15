CREATE TABLE "lead_conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"lead_id" integer,
	"message_type" "message_type",
	"message_text" text,
	"send_by" "send_by" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "lead_conversation" ADD CONSTRAINT "lead_conversation_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_conversation" ADD CONSTRAINT "lead_conversation_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;