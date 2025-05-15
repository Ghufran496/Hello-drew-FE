CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"filename" text NOT NULL,
	"status" varchar(255) NOT NULL,
	"docusign_envelope_id" text,
	"contract_name" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "docusign_auth_states" (
	"id" serial PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "docusign_auth_states_state_unique" UNIQUE("state")
);
--> statement-breakpoint
CREATE TABLE "user_docusign_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"account_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "docusign_auth_states" ADD CONSTRAINT "docusign_auth_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_docusign_credentials" ADD CONSTRAINT "user_docusign_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;