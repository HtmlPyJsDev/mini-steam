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
import type { UploadProgress } from '../api/multipartUpload';
import type { Game } from '../types';

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

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'developer' && user.role !== 'admin') return;
    getDeveloperSlot()
      .then((res) => {
        setSlotUsed(res.slotUsed);
        setGame(res.game);
      })
      .catch(() => setSlotUsed(false));
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
      </section>
    </div>
  );
}
