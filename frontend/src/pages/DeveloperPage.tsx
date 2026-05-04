import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import {
  getDeveloperSlot,
  uploadDeveloperGameFile,
  createDeveloperGame,
} from '../api/developer';
import {
  postUpdate,
  listUserUpdates,
  deleteUpdate,
  listSubscribers,
} from '../api/social';
import { Avatar } from '../components/Avatar';
import type { UploadProgress } from '../api/multipartUpload';
import type { DevUpdate, Game, PublicUser } from '../types';

export function DeveloperPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [slotUsed, setSlotUsed] = useState<boolean | null>(null);
  const [game, setGame] = useState<Game | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [license, setLicense] = useState('');
  const [gpuTier, setGpuTier] = useState<number>(3);
  const [cover, setCover] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<UploadProgress>({ kind: 'idle' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [updates, setUpdates] = useState<DevUpdate[]>([]);
  const [updateCaption, setUpdateCaption] = useState('');
  const [updateImage, setUpdateImage] = useState<File | null>(null);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<PublicUser[]>([]);

  async function reloadUpdates(uid: string) {
    try {
      const r = await listUserUpdates(uid);
      setUpdates(r.updates);
    } catch {
      /* ignore */
    }
  }

  async function reloadSubscribers(uid: string) {
    try {
      const r = await listSubscribers(uid);
      setSubscribers(r.subscribers);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'developer' && user.role !== 'admin') return;
    getDeveloperSlot()
      .then((res) => {
        setSlotUsed(res.slotUsed);
        setGame(res.game);
      })
      .catch(() => setSlotUsed(false));
    void reloadUpdates(user._id);
    void reloadSubscribers(user._id);
  }, [user]);

  if (!user) return null;

  if (user.role !== 'developer' && user.role !== 'admin') {
    return (
      <div className="container">
        <section className="settings paywall">
          <header className="settings__header">
            <h1>{t('developer.title')}</h1>
            <p>{t('paywall.title')}</p>
          </header>
          <div className="paywall__body">
            <div className="paywall__icon" aria-hidden="true">
              🔒
            </div>
            <p className="paywall__text">{t('paywall.developer')}</p>
            <Link to="/shop" className="btn btn--primary paywall__cta">
              {t('paywall.buy')}
            </Link>
          </div>
        </section>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !description.trim() || !license.trim()) {
      setError(t('common.error'));
      return;
    }
    if (!cover || !gameFile) {
      setError(t('common.error'));
      return;
    }
    setSubmitting(true);
    try {
      const resolved = await uploadDeveloperGameFile(gameFile, setProgress);
      setProgress({ kind: 'finalizing' });
      const res = await createDeveloperGame({
        title: title.trim(),
        description,
        license: license.trim(),
        gpuTier,
        cover,
        screenshots,
        gameFileKey: resolved.key,
        gameFileUrl: resolved.url,
        gameFileSize: resolved.size,
      });
      setGame(res.game);
      setSlotUsed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setProgress({ kind: 'idle' });
      setSubmitting(false);
    }
  }

  function onCover(e: ChangeEvent<HTMLInputElement>) {
    setCover(e.target.files?.[0] || null);
  }
  function onShots(e: ChangeEvent<HTMLInputElement>) {
    setScreenshots(e.target.files ? Array.from(e.target.files) : []);
  }
  function onGameFile(e: ChangeEvent<HTMLInputElement>) {
    setGameFile(e.target.files?.[0] || null);
  }

  function statusBadge(status?: string) {
    if (status === 'approved')
      return <span className="badge badge--success">{t('developer.statusApproved')}</span>;
    if (status === 'rejected')
      return <span className="badge badge--danger">{t('developer.statusRejected')}</span>;
    return <span className="badge">{t('developer.statusPending')}</span>;
  }

  async function handlePostUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUpdateError(null);
    const caption = updateCaption.trim();
    if (!caption) {
      setUpdateError(t('developer.updates.captionRequired'));
      return;
    }
    setPostingUpdate(true);
    try {
      const fd = new FormData();
      fd.append('caption', caption);
      if (updateImage) fd.append('image', updateImage);
      await postUpdate(fd);
      setUpdateCaption('');
      setUpdateImage(null);
      if (user) await reloadUpdates(user._id);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setPostingUpdate(false);
    }
  }

  async function handleDeleteUpdate(updateId: string) {
    try {
      await deleteUpdate(updateId);
      if (user) await reloadUpdates(user._id);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : t('common.error'));
    }
  }

  return (
    <div className="container">
      <section className="settings">
        <header className="settings__header">
          <h1>{t('developer.title')}</h1>
          <p>{slotUsed ? t('developer.slotUsed') : t('developer.slotFree')}</p>
        </header>

        {slotUsed && game ? (
          <section className="settings__group">
            <div className="profile__item-link" style={{ display: 'flex', gap: 16 }}>
              {game.coverUrl ? (
                <img src={game.coverUrl} alt={game.title} style={{ width: 120, borderRadius: 8 }} />
              ) : null}
              <div>
                <h3>
                  {game.status === 'approved' ? (
                    <Link to={`/game/${game._id}`}>{game.title}</Link>
                  ) : (
                    game.title
                  )}
                </h3>
                <p>{game.license}</p>
                {statusBadge(game.status)}
              </div>
            </div>
          </section>
        ) : (
          <section className="settings__group">
            <p className="settings__hint">{t('developer.slotHint')}</p>
            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>{t('developer.title2')}</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>{t('developer.description')}</span>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>{t('developer.license')}</span>
                <input
                  type="text"
                  value={license}
                  placeholder="GPL-3.0, MIT, CC0, ..."
                  onChange={(e) => setLicense(e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>{t('admin.gpuTier')}</span>
                <select
                  value={gpuTier}
                  onChange={(e) => setGpuTier(Number(e.target.value))}
                >
                  <option value={1}>1 — pixel art / 2D</option>
                  <option value={2}>2 — small 3D</option>
                  <option value={3}>3 — mainstream 3D</option>
                  <option value={4}>4 — AAA mid</option>
                  <option value={5}>5 — AAA heavy</option>
                </select>
                <small className="field__hint">{t('admin.gpuTierHint')}</small>
              </label>
              <label className="field">
                <span>{t('developer.coverImage')}</span>
                <input type="file" accept="image/*" onChange={onCover} />
                {cover ? <small>{cover.name}</small> : null}
              </label>
              <label className="field">
                <span>{t('developer.screenshots')}</span>
                <input type="file" accept="image/*" multiple onChange={onShots} />
                {screenshots.length > 0 ? <small>{screenshots.length} file(s)</small> : null}
              </label>
              <label className="field">
                <span>{t('developer.gameFile')}</span>
                <input
                  type="file"
                  accept=".zip,.rar,.7z,.tar,.gz,.tgz,.exe,.msi,.appimage,.dmg,.deb,.pkg,.iso"
                  onChange={onGameFile}
                />
                {gameFile ? <small>{gameFile.name}</small> : null}
              </label>

              {progress.kind === 'uploading' && progress.total ? (
                <div className="progress-banner">
                  <span>
                    {Math.round(((progress.loaded || 0) / progress.total) * 100)}%
                  </span>
                  <div className="progress-bar">
                    <div
                      className="progress-bar__fill"
                      style={{
                        width: `${Math.min(100, Math.round(((progress.loaded || 0) / progress.total) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ) : progress.kind === 'presigning' ? (
                <div className="progress-banner">
                  <span>…</span>
                </div>
              ) : progress.kind === 'finalizing' ? (
                <div className="progress-banner">
                  <span>{t('developer.submitting')}</span>
                </div>
              ) : null}

              {error ? <div className="error-banner">{error}</div> : null}

              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                {submitting ? t('developer.submitting') : t('developer.submit')}
              </button>
            </form>
          </section>
        )}

        {slotUsed ? (
          <>
            <section className="settings__group">
              <h2>{t('developer.updates.postTitle')}</h2>
              <p className="settings__hint">{t('developer.updates.postHint')}</p>
              <form onSubmit={handlePostUpdate}>
                <label className="field">
                  <span>{t('developer.updates.captionLabel')}</span>
                  <textarea
                    rows={3}
                    value={updateCaption}
                    onChange={(e) => setUpdateCaption(e.target.value)}
                    maxLength={600}
                    placeholder={t('developer.updates.captionPlaceholder')}
                  />
                </label>
                <label className="field">
                  <span>{t('developer.updates.imageLabel')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUpdateImage(e.target.files?.[0] || null)}
                  />
                  {updateImage ? <small>{updateImage.name}</small> : null}
                </label>
                {updateError ? <div className="error-banner">{updateError}</div> : null}
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={postingUpdate || !updateCaption.trim()}
                >
                  {postingUpdate ? '…' : t('developer.updates.postButton')}
                </button>
              </form>
            </section>

            {updates.length > 0 ? (
              <section className="settings__group">
                <h2>{t('developer.updates.historyTitle')}</h2>
                <div className="updates-feed">
                  {updates.map((u) => (
                    <article key={u._id} className="update-card">
                      {u.imageUrl ? (
                        <div className="update-card__image">
                          <img src={u.imageUrl} alt="" loading="lazy" />
                        </div>
                      ) : null}
                      <div className="update-card__body">
                        <header className="update-card__head">
                          <span className="update-card__time">
                            {new Date(u.createdAt).toLocaleString()}
                          </span>
                        </header>
                        <p className="update-card__caption">{u.caption}</p>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => handleDeleteUpdate(u._id)}
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="settings__group">
              <h2>
                {t('developer.subscribersTitle')} ({subscribers.length})
              </h2>
              {subscribers.length === 0 ? (
                <p className="settings__hint">{t('developer.subscribersEmpty')}</p>
              ) : (
                <ul className="dock__user-list">
                  {subscribers.map((s) => (
                    <li key={s._id}>
                      <Link to={`/u/${s._id}`} className="dock-user">
                        <Avatar
                          size={32}
                          src={s.avatarUrl}
                          name={s.displayName}
                          email={s.email}
                        />
                        <span className="dock-user__body">
                          <span className="dock-user__name">
                            {s.displayName || s.email.split('@')[0]}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </section>
    </div>
  );
}
