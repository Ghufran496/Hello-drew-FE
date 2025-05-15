ALTER TABLE "voices" ADD COLUMN "type" varchar(255);--> statement-breakpoint
ALTER TABLE "voices" ADD COLUMN "traits" varchar(255);--> statement-breakpoint
ALTER TABLE "voices" ADD COLUMN "gender" varchar(255);--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN "traits";--> statement-breakpoint
ALTER TABLE "agents" DROP COLUMN "gender";