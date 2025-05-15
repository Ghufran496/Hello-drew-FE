CREATE TABLE "voices" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"override_agent_id" varchar(255),
	"description" text,
	"recording_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);