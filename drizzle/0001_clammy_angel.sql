ALTER TABLE "pg-drizzle_user" ADD COLUMN "credits_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pg-drizzle_user" ADD COLUMN "credits_granted" integer;