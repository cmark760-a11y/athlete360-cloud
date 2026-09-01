import { useEffect, useState, useCallback } from "react";
import { getUser, handleAuthCallback, logout, onAuthChange, type User } from "@netlify/identity";
import { api } from "./lib/api";
import type { Athlete, AthleteInput } from "./types";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import AthleteDetail from "./components/AthleteDetail";

type View = { type: "dashboard" } | { type: "athlete"; id: number };

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [view, setView] = useState<View>({ type: "dashboard" });
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    handleAuthCallback()
      .catch(() => null)
      .finally(async () => {
        const current = await getUser();
        if (active) setUser(current);
      });
    const unsubscribe = onAuthChange((_event, nextUser) => {
      setUser(nextUser);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const loadAthletes = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .listAthletes()
      .then(setAthletes)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the roster."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) loadAthletes();
  }, [user, loadAthletes]);

  async function handleCreateAthlete(input: AthleteInput) {
    const created = await api.createAthlete(input);
    setAthletes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleUpdateAthlete(id: number, input: AthleteInput) {
    const updated = await api.updateAthlete(id, input);
    setAthletes((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }

  async function handleDeleteAthlete(id: number) {
    await api.deleteAthlete(id);
    setAthletes((prev) => prev.filter((a) => a.id !== id));
    setView({ type: "dashboard" });
  }

  if (user === undefined) {
    return null;
  }

  if (!user) {
    return <LoginScreen onAuthenticated={setUser} />;
  }

  const selectedAthlete = view.type === "athlete" ? athletes.find((a) => a.id === view.id) ?? null : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="wordmark">
          ATHLETE<span>360</span>
          <small>Training Ledger</small>
        </div>
        <div className="header-user">
          <span>{user.name ?? user.email}</span>
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              setUser(null);
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="main-view">
        {view.type === "dashboard" && (
          <Dashboard
            athletes={athletes}
            loading={loading}
            error={error}
            onSelectAthlete={(id) => setView({ type: "athlete", id })}
            onCreateAthlete={handleCreateAthlete}
          />
        )}
        {view.type === "athlete" && selectedAthlete && (
          <AthleteDetail
            athlete={selectedAthlete}
            onBack={() => setView({ type: "dashboard" })}
            onUpdate={handleUpdateAthlete}
            onDelete={handleDeleteAthlete}
          />
        )}
        {view.type === "athlete" && !selectedAthlete && !loading && (
          <div className="empty-state">
            <h3>Athlete not found</h3>
            <p>This athlete may have been removed.</p>
            <button className="btn btn-primary" onClick={() => setView({ type: "dashboard" })}>
              Back to roster
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
