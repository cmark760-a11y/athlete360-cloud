CREATE TABLE "athletes" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"sport" text NOT NULL,
	"position" text,
	"team" text,
	"birth_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY,
	"athlete_id" integer NOT NULL,
	"date" date NOT NULL,
	"type" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"rpe" integer,
	"distance_km" real,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_athlete_id_athletes_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athletes"("id") ON DELETE CASCADE;