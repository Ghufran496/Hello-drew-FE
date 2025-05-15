CREATE TABLE "recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_id" integer,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"docusign_recipient_id" text,
	"client_user_id" text,
	"status" varchar(50),
	"routing_order" varchar(5),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" DROP COLUMN "recipients";