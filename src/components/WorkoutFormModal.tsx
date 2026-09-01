import { useState, type FormEvent } from "react";
import { WORKOUT_TYPES, type WorkoutInput } from "../types";

interface WorkoutFormModalProps {
  onClose: () => void;
  onSave: (input: WorkoutInput) => Promise<void>;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function WorkoutFormModal({ onClose, onSave }: WorkoutFormModalProps) {
  const [date, setDate] = useState(today());
  const [type, setType] = useState<string>(WORKOUT_TYPES[0]);
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [rpe, setRpe] = useState("5");
  const [distanceKm, setDistanceKm] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const duration = Number(durationMinutes);
    if (!date || !type || !duration || duration <= 0) {
      setError("Date, type and a positive duration are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        date,
        type,
        durationMinutes: duration,
        rpe: rpe ? Number(rpe) : null,
        distanceKm: distanceKm ? Number(distanceKm) : null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save session.");
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Log a session</h2>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="w-date">Date</label>
              <input id="w-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="w-type">Type</label>
              <select id="w-type" value={type} onChange={(e) => setType(e.target.value)}>
                {WORKOUT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="w-duration">Duration (min)</label>
              <input
                id="w-duration"
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="w-rpe">RPE (1–10)</label>
              <input
                id="w-rpe"
                type="number"
                min={1}
                max={10}
                value={rpe}
                onChange={(e) => setRpe(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="w-distance">Distance (km, optional)</label>
            <input
              id="w-distance"
              type="number"
              step="0.1"
              min={0}
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="w-notes">Notes</label>
            <textarea id="w-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Log session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
