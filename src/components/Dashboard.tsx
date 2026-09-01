import { useEffect, useState } from "react";
import { api, type DashboardStats } from "../lib/api";
import type { Athlete, AthleteInput } from "../types";
import AthleteFormModal from "./AthleteFormModal";

interface DashboardProps {
  athletes: Athlete[];
  loading: boolean;
  error: string | null;
  onSelectAthlete: (id: number) => void;
  onCreateAthlete: (input: AthleteInput) => Promise<void>;
}

export default function Dashboard({ athletes, loading, error, onSelectAthlete, onCreateAthlete }: DashboardProps) {
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api
      .getStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, [athletes.length]);

  return (
    <div>
      <div className="view-header">
        <div>
          <h1>Roster</h1>
          <p className="subtitle">Every athlete on the program, at a glance.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add athlete
        </button>
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="label">Athletes tracked</div>
          <div className="value">{stats ? stats.totalAthletes : "—"}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Sessions this week</div>
          <div className="value">{stats ? stats.sessionsThisWeek : "—"}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Avg. RPE this week</div>
          <div className="value">
            {stats && stats.avgRpeThisWeek !== null ? stats.avgRpeThisWeek : "—"}
            {stats && stats.avgRpeThisWeek !== null && <small>/ 10</small>}
          </div>
        </div>
      </div>

      {error && <div className="banner-error">{error}</div>}

      {loading ? (
        <div className="skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="skeleton-card" key={i} />
          ))}
        </div>
      ) : athletes.length === 0 ? (
        <div className="empty-state">
          <h3>No athletes yet</h3>
          <p>Add your first athlete to start logging sessions and tracking training load.</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add athlete
          </button>
        </div>
      ) : (
        <div className="roster-grid">
          {athletes.map((athlete) => (
            <button className="athlete-card" key={athlete.id} onClick={() => onSelectAthlete(athlete.id)}>
              <div className="name">{athlete.name}</div>
              <div className="tag-row">
                <span className="tag">{athlete.sport}</span>
                {athlete.position && <span className="tag neutral">{athlete.position}</span>}
              </div>
              <div className="meta">{athlete.team ?? "Unassigned team"}</div>
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <AthleteFormModal
          onClose={() => setShowForm(false)}
          onSave={async (input) => {
            await onCreateAthlete(input);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
