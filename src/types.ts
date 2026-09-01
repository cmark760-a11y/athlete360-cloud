export interface Athlete {
  id: number;
  name: string;
  sport: string;
  position: string | null;
  team: string | null;
  birthDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Workout {
  id: number;
  athleteId: number;
  date: string;
  type: string;
  durationMinutes: number;
  rpe: number | null;
  distanceKm: number | null;
  notes: string | null;
  createdAt: string;
}

export type AthleteInput = Omit<Athlete, "id" | "createdAt">;
export type WorkoutInput = Omit<Workout, "id" | "athleteId" | "createdAt">;

export const WORKOUT_TYPES = ["Strength", "Conditioning", "Skills", "Recovery", "Game"] as const;
