import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Athlete, AthleteInput, Workout, WorkoutInput } from "../types";
import AthleteFormModal from "./AthleteFormModal";
import WorkoutFormModal from "./WorkoutFormModal";
import LoadChart, { type LoadChartPoint } from "./LoadChart";

interface AthleteDetailProps {
  athlete: Athlete;
  onBack: () => void;
  onUpdate: (id: number, input: AthleteInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday as start of week
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildWeeklyLoad(workouts: Workout[]): LoadChartPoint[] {
  const today = new Date();
  const currentWeekStart = startOfWeek(today);
  const buckets: LoadChartPoint[] = [];

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const inWeek = workouts.filter((w) => {
      const d = new Date(w.date);
      return d >= weekStart && d <= weekEnd;
    });

    const totalMinutes = inWeek.reduce((sum, w) => sum + w.durationMinutes, 0);
    const rpeValues = inWeek.map((w) => w.rpe).filter((v): v is number => v !== null);
    const avgRpe = rpeValues.length
      ? Math.round((rpeValues.reduce((s, v) => s + v, 0) / rpeValues.length) * 10) / 10
      : null;

    buckets.push({
      weekLabel: weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      totalMinutes,
      sessionCount: inWeek.length,
      avgRpe,
    });
  }

  return buckets;
}

export default function AthleteDetail({ athlete, onBack, onUpdate, onDelete }: AthleteDetailProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .listWorkouts(athlete.id)
      .then(setWorkouts)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load sessions."))
      .finally(() => setLoading(false));
  }, [athlete.id]);

  async function handleAddWorkout(input: WorkoutInput) {
    const created = await api.createWorkout(athlete.id, input);
    setWorkouts((prev) => [created, ...prev]);
    setShowWorkoutForm(false);
  }

  async function handleDeleteWorkout(id: number) {
    await api.deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleDeleteAthlete() {
    if (!window.confirm(`Remove ${athlete.name} and all logged sessions? This cannot be undone.`)) return;
    await onDelete(athlete.id);
  }

  const age = athlete.birthDate
    ? Math.floor((Date.now() - new Date(athlete.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div>
      <button className="back-link" onClick={onBack}>
        ← Back to roster
      </button>

      <div className="profile-layout">
        <div className="profile-card">
          <div className="name">{athlete.name}</div>
          <div className="tag-row">
            <span className="tag">{athlete.sport}</span>
            {athlete.position && <span className="tag neutral">{athlete.position}</span>}
          </div>
          <dl className="field-list">
            <div>
              <dt>Team</dt>
              <dd>{athlete.team ?? "Unassigned"}</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>{age !== null ? `${age} years` : "Not on file"}</dd>
            </div>
            {athlete.notes && (
              <div>
                <dt>Notes</dt>
                <dd>{athlete.notes}</dd>
              </div>
            )}
          </dl>
          <div className="profile-actions">
            <button className="btn" onClick={() => setShowEdit(true)}>
              Edit
            </button>
            <button className="btn btn-ghost btn-danger" onClick={handleDeleteAthlete}>
              Remove
            </button>
          </div>
        </div>

        <div className="chart-card">
          <h3>Training load</h3>
          <p className="chart-caption">Total minutes logged per week, last 8 weeks</p>
          <LoadChart data={buildWeeklyLoad(workouts)} />
        </div>
      </div>

      <div className="log-section">
        <h2 style={{ fontSize: 18 }}>Session log</h2>
        <button className="btn btn-primary" onClick={() => setShowWorkoutForm(true)}>
          + Log session
        </button>
      </div>

      {error && <div className="banner-error">{error}</div>}

      {loading ? (
        <div className="skeleton-grid" style={{ gridTemplateColumns: "1fr" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="skeleton-card" style={{ height: 48 }} key={i} />
          ))}
        </div>
      ) : workouts.length === 0 ? (
        <div className="empty-state">
          <h3>No sessions logged</h3>
          <p>Log the first training session to start building this athlete&rsquo;s load history.</p>
          <button className="btn btn-primary" onClick={() => setShowWorkoutForm(true)}>
            + Log session
          </button>
        </div>
      ) : (
        <div className="log-list">
          {workouts.map((w) => (
            <div className="log-row" key={w.id}>
              <span className="date">{new Date(w.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              <span className="type">{w.type}</span>
              <span className="notes">{w.notes ?? ""}</span>
              <span className="duration">{w.durationMinutes} min</span>
              <span className="rpe">{w.rpe !== null ? `RPE ${w.rpe}` : "—"}</span>
              <button className="delete-btn" onClick={() => handleDeleteWorkout(w.id)} aria-label="Delete session">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {showEdit && (
        <AthleteFormModal
          initial={athlete}
          onClose={() => setShowEdit(false)}
          onSave={async (input) => {
            await onUpdate(athlete.id, input);
            setShowEdit(false);
          }}
        />
      )}

      {showWorkoutForm && (
        <WorkoutFormModal onClose={() => setShowWorkoutForm(false)} onSave={handleAddWorkout} />
      )}
    </div>
  );
}
