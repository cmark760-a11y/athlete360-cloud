import type { Athlete, AthleteInput, Workout, WorkoutInput } from "../types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface DashboardStats {
  totalAthletes: number;
  sessionsThisWeek: number;
  avgRpeThisWeek: number | null;
}

export const api = {
  listAthletes: () => request<Athlete[]>("/api/athletes"),
  getStats: () => request<DashboardStats>("/api/stats"),
  getAthlete: (id: number) => request<Athlete>(`/api/athletes/${id}`),
  createAthlete: (input: AthleteInput) =>
    request<Athlete>("/api/athletes", { method: "POST", body: JSON.stringify(input) }),
  updateAthlete: (id: number, input: AthleteInput) =>
    request<Athlete>(`/api/athletes/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteAthlete: (id: number) => request<void>(`/api/athletes/${id}`, { method: "DELETE" }),

  listWorkouts: (athleteId: number) => request<Workout[]>(`/api/athletes/${athleteId}/workouts`),
  createWorkout: (athleteId: number, input: WorkoutInput) =>
    request<Workout>(`/api/athletes/${athleteId}/workouts`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  deleteWorkout: (id: number) => request<void>(`/api/workouts/${id}`, { method: "DELETE" }),
};
