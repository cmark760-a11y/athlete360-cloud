import { pgTable, serial, text, integer, real, date, timestamp } from "drizzle-orm/pg-core";

export const athletes = pgTable("athletes", {
  id: serial().primaryKey(),
  name: text().notNull(),
  sport: text().notNull(),
  position: text(),
  team: text(),
  birthDate: date("birth_date"),
  notes: text(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: serial().primaryKey(),
  athleteId: integer("athlete_id")
    .notNull()
    .references(() => athletes.id, { onDelete: "cascade" }),
  date: date().notNull(),
  type: text().notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  rpe: integer(),
  distanceKm: real("distance_km"),
  notes: text(),
  createdAt: timestamp("created_at").defaultNow(),
});
