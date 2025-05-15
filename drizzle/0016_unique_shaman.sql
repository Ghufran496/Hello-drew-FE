CREATE TABLE IF NOT EXISTS "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" varchar(255),
	"voiceId" varchar(255),
	"welcomeMessage" text,
	"tone" jsonb DEFAULT '{"name":"friendly-conversational","description":"Warm, approachable, and casual to build rapport."}'::jsonb,
	"prompt" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "team_activity" ALTER COLUMN "details" SET DATA TYPE varchar(255);--> statement-breakpoint