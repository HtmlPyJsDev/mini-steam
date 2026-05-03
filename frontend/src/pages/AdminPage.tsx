import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { listGames } from '../api/games';
import { createGame, deleteGame, updateGame, type AdminGamePayload } from '../api/admin';
import type { Game } from '../types';
import { Loader } from '../components/Loader';

interface FormState {
  title: string;
  description: string;
  license: string;
  cover: File | null;
  screenshots: File[];
  gameFile: File | null;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  license: '',
  cover: null,
  screenshots: [],
  gameFile: null,
};

export function AdminPage() {
  const [games, setGames] = useState<Game[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  async function loadGames() {
    try {
      const res = await listGames();
      setGames(res.games);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
      setGames([]);
    }
  }

  useEffect(() => {
    void loadGames();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleEdit(game: Game) {
    setEditingId(game._id);
    setForm({
      title: game.title,
      description: game.description,
      license: game.license,
      cover: null,
      screenshots: [],
      gameFile: null,
    });
    setError(null);
    setSuccess(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleDelete(id: string) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this game? The file in R2 will also be removed.')) {
      return;
    }
    try {
      await deleteGame(id);
      setSuccess('Game deleted');
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim() || !form.description.trim() || !form.license.trim()) {
      setError('Title, description, and license are required.');
      return;
    }

    if (!isEditing && (!form.cover || !form.gameFile)) {
      setError('Cover image and game file are required for new games.');
      return;
    }

    const payload: AdminGamePayload = {
      title: form.title.trim(),
      description: form.description,
      license: form.license.trim(),
      cover: form.cover,
      screenshots: form.screenshots,
      gameFile: form.gameFile,
    };

    setSubmitting(true);
    try {
      if (isEditing && editingId) {
        await updateGame(editingId, payload);
        setSuccess('Game updated');
      } else {
        await createGame(payload);
        setSuccess('Game created');
      }
      resetForm();
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  }

  function onCoverChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, cover: e.target.files?.[0] || null }));
  }
  function onShotsChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, screenshots: e.target.files ? Array.from(e.target.files) : [] }));
  }
  function onGameFileChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, gameFile: e.target.files?.[0] || null }));
  }

  return (
    <div className="container">
      <h1 className="admin__title">Admin · Games</h1>

      <section className="admin__form-card">
        <header className="admin__form-header">
          <h2>{isEditing ? 'Edit game' : 'Add a new game'}</h2>
          {isEditing ? (
            <button type="button" className="btn btn--ghost" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </header>

        <form className="admin__form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={5}
              required
            />
          </label>

          <label className="field">
            <span>License (required — only legally free / open-source licenses)</span>
            <input
              type="text"
              value={form.license}
              onChange={(e) => setForm((s) => ({ ...s, license: e.target.value }))}
              placeholder="e.g. GPL-3.0, MIT, CC0, Public Domain, Freeware (developer-approved)"
              required
            />
          </label>

          <label className="field">
            <span>
              Cover image {isEditing ? <em>(optional — upload to replace)</em> : null}
            </span>
            <input type="file" accept="image/*" onChange={onCoverChange} />
            {form.cover ? <small>Selected: {form.cover.name}</small> : null}
          </label>

          <label className="field">
            <span>
              Screenshots {isEditing ? <em>(optional — uploading replaces all)</em> : null}
            </span>
            <input type="file" accept="image/*" multiple onChange={onShotsChange} />
            {form.screenshots.length > 0 ? (
              <small>{form.screenshots.length} file(s) selected</small>
            ) : null}
          </label>

          <label className="field">
            <span>
              Game file {isEditing ? <em>(optional — upload to replace)</em> : null}
            </span>
            <input
              type="file"
              accept=".zip,.rar,.7z,.tar,.gz,.tgz,.exe,.msi,.appimage,.dmg,.deb,.pkg,.iso"
              onChange={onGameFileChange}
            />
            {form.gameFile ? <small>Selected: {form.gameFile.name}</small> : null}
          </label>

          {error ? <div className="error-banner">{error}</div> : null}
          {success ? <div className="success-banner">{success}</div> : null}

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create game'}
          </button>
        </form>
      </section>

      <section className="admin__list">
        <h2>All games</h2>
        {games === null ? (
          <Loader label="Loading…" />
        ) : games.length === 0 ? (
          <div className="empty-state">No games yet.</div>
        ) : (
          <ul className="admin__games">
            {games.map((g) => (
              <li key={g._id} className="admin__game">
                <div className="admin__game-info">
                  {g.coverUrl ? (
                    <img src={g.coverUrl} alt={g.title} />
                  ) : (
                    <div className="admin__game-placeholder">No cover</div>
                  )}
                  <div>
                    <h3>{g.title}</h3>
                    <p className="admin__game-license">{g.license}</p>
                  </div>
                </div>
                <div className="admin__game-actions">
                  <button type="button" className="btn btn--ghost" onClick={() => handleEdit(g)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => handleDelete(g._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
