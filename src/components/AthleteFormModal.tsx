import { useState, type FormEvent } from "react";
import type { Athlete, AthleteInput } from "../types";

interface AthleteFormModalProps {
  initial?: Athlete | null;
  onClose: () => void;
  onSave: (input: AthleteInput) => Promise<void>;
}

export default function AthleteFormModal({ initial, onClose, onSave }: AthleteFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sport, setSport] = useState(initial?.sport ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [team, setTeam] = useState(initial?.team ?? "");
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !sport.trim()) {
      setError("Name and sport are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        sport: sport.trim(),
        position: position.trim() || null,
        team: team.trim() || null,
        birthDate: birthDate || null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save athlete.");
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? "Edit athlete" : "Add athlete"}</h2>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="a-name">Name</label>
            <input id="a-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="a-sport">Sport</label>
              <input id="a-sport" value={sport} onChange={(e) => setSport(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="a-position">Position</label>
              <input id="a-position" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="a-team">Team</label>
              <input id="a-team" value={team} onChange={(e) => setTeam(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="a-birth">Birth date</label>
              <input id="a-birth" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="a-notes">Notes</label>
            <textarea id="a-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save athlete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
