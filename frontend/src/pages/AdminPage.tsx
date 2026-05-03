import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { listGames } from '../api/games';
import {
  createGame,
  deleteGame,
  updateGame,
  listUsers,
  setUserRole,
  banUser,
  unbanUser,
  listPendingGames,
  setGameStatus,
  type AdminGamePayload,
  type UploadProgress,
} from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import { Avatar } from '../components/Avatar';
import { RolePill } from '../components/RolePill';
import type { Game, User, UserRole } from '../types';
import { Loader } from '../components/Loader';

function formatProgress(p: UploadProgress): string {
  if (p.kind === 'presigning') return 'Requesting upload URL…';
  if (p.kind === 'uploading') {
    const pct = p.total > 0 ? Math.round((p.loaded / p.total) * 100) : 0;
    const mb = (n: number) => (n / (1024 * 1024)).toFixed(1);
    return `Uploading game file to R2: ${pct}% (${mb(p.loaded)} / ${mb(p.total)} MB)`;
  }
  if (p.kind === 'finalizing') return 'Saving game metadata…';
  return '';
}

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

type Tab = 'games' | 'pending' | 'users';

export function AdminPage() {
  const { user: me } = useAuth();
  const { t } = useTranslation();
  const isAdmin = me?.role === 'admin';
  const [tab, setTab] = useState<Tab>(isAdmin ? 'games' : 'pending');

  return (
    <div className="container">
      <h1 className="admin__title">{isAdmin ? 'Admin · Uzisoft' : 'Security · Uzisoft'}</h1>

      <div className="admin__tabs">
        {isAdmin && (
          <button
            type="button"
            className={`admin__tab${tab === 'games' ? ' is-active' : ''}`}
            onClick={() => setTab('games')}
          >
            {t('admin.tabsGames')}
          </button>
        )}
        <button
          type="button"
          className={`admin__tab${tab === 'pending' ? ' is-active' : ''}`}
          onClick={() => setTab('pending')}
        >
          {t('admin.tabsPending')}
        </button>
        <button
          type="button"
          className={`admin__tab${tab === 'users' ? ' is-active' : ''}`}
          onClick={() => setTab('users')}
        >
          {t('admin.tabsUsers')}
        </button>
      </div>

      {tab === 'games' && isAdmin ? <GamesTab /> : null}
      {tab === 'pending' ? <PendingTab /> : null}
      {tab === 'users' ? <UsersTab meId={me?._id} canEditRoles={isAdmin} /> : null}
    </div>
  );
}

function GamesTab() {
  const [games, setGames] = useState<Game[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ kind: 'idle' });
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
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Delete this game? The file in R2 will also be removed.')
    ) {
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
    setProgress({ kind: 'idle' });
    try {
      if (isEditing && editingId) {
        await updateGame(editingId, payload, setProgress);
        setSuccess('Game updated');
      } else {
        await createGame(payload, setProgress);
        setSuccess('Game created');
      }
      resetForm();
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSubmitting(false);
      setProgress({ kind: 'idle' });
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
    <>
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
            <span>Cover image {isEditing ? <em>(optional — upload to replace)</em> : null}</span>
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
            <span>Game file {isEditing ? <em>(optional — upload to replace)</em> : null}</span>
            <input
              type="file"
              accept=".zip,.rar,.7z,.tar,.gz,.tgz,.exe,.msi,.appimage,.dmg,.deb,.pkg,.iso"
              onChange={onGameFileChange}
            />
            {form.gameFile ? <small>Selected: {form.gameFile.name}</small> : null}
          </label>

          {progress.kind !== 'idle' ? (
            <div className="progress-banner">
              <span>{formatProgress(progress)}</span>
              {progress.kind === 'uploading' && progress.total > 0 ? (
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{
                      width: `${Math.min(100, Math.round((progress.loaded / progress.total) * 100))}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

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
                    {g.status && g.status !== 'approved' ? (
                      <span className={`badge badge--${g.status === 'pending' ? '' : 'danger'}`}>
                        {g.status}
                      </span>
                    ) : null}
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
    </>
  );
}

function PendingTab() {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await listPendingGames();
      setGames(res.games);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setGames([]);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function decide(id: string, status: 'approved' | 'rejected') {
    setBusy(true);
    try {
      await setGameStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin__list">
      <h2>{t('admin.pendingTitle')}</h2>
      {error ? <div className="error-banner">{error}</div> : null}
      {games === null ? (
        <Loader label={t('common.loading')} />
      ) : games.length === 0 ? (
        <div className="empty-state">{t('admin.pendingEmpty')}</div>
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
                  {typeof g.uploaderId === 'object' && g.uploaderId ? (
                    <p>
                      <Link to={`/u/${g.uploaderId._id}`}>{g.uploaderId.email}</Link>
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="admin__game-actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={busy}
                  onClick={() => decide(g._id, 'approved')}
                >
                  {t('admin.approve')}
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  disabled={busy}
                  onClick={() => decide(g._id, 'rejected')}
                >
                  {t('admin.reject')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function UsersTab({ meId, canEditRoles }: { meId?: string; canEditRoles: boolean }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load(q?: string) {
    try {
      const res = await listUsers(q);
      setUsers(res.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setUsers([]);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      void load(query.trim() || undefined);
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function changeRole(id: string, role: UserRole) {
    if (typeof window !== 'undefined' && !window.confirm(t('admin.changeRoleConfirm'))) return;
    setBusy(true);
    try {
      await setUserRole(id, role);
      await load(query.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  async function ban(id: string) {
    if (typeof window === 'undefined') return;
    if (!window.confirm(t('admin.banConfirm'))) return;
    const reason = window.prompt(t('admin.banReasonPrompt')) || '';
    setBusy(true);
    try {
      await banUser(id, reason);
      await load(query.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  async function unban(id: string) {
    setBusy(true);
    try {
      await unbanUser(id);
      await load(query.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin__list">
      <h2>{t('admin.users')}</h2>
      <input
        type="search"
        className="lang-select"
        style={{ width: '100%', padding: '10px 12px', marginBottom: 12 }}
        placeholder={t('admin.searchUsers')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {error ? <div className="error-banner">{error}</div> : null}
      {users === null ? (
        <Loader label={t('common.loading')} />
      ) : (
        <ul className="friend-list">
          {users.map((u) => {
            const isMe = u._id === meId;
            return (
              <li key={u._id} className="friend-item">
                <Link to={`/u/${u._id}`} className="friend-item__link">
                  <Avatar
                    src={u.avatarUrl}
                    name={u.displayName}
                    email={u.email}
                    size={40}
                  />
                  <div>
                    <strong>
                      {u.displayName || u.email.split('@')[0]}
                      {u.banned ? (
                        <span className="badge badge--danger" style={{ marginLeft: 8 }}>
                          {t('admin.userBanned')}
                        </span>
                      ) : null}
                    </strong>
                    <small>{u.email}</small>
                  </div>
                </Link>
                <div className="friend-item__actions">
                  <RolePill role={u.role} />
                  {canEditRoles ? (
                    <select
                      className="lang-select"
                      value={u.role}
                      disabled={busy || isMe}
                      onChange={(e) => changeRole(u._id, e.target.value as UserRole)}
                    >
                      <option value="user">user</option>
                      <option value="developer">developer</option>
                      <option value="security">security</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : null}
                  {u.banned ? (
                    <button
                      type="button"
                      className="btn btn--ghost btn--small"
                      disabled={busy}
                      onClick={() => unban(u._id)}
                    >
                      {t('admin.unban')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--danger btn--small"
                      disabled={busy || isMe}
                      onClick={() => ban(u._id)}
                    >
                      {t('admin.ban')}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
