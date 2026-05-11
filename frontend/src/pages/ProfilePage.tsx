import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import { updateMe, uploadAvatar, deleteAvatar } from '../api/me';
import { Avatar } from '../components/Avatar';
import { RolePill } from '../components/RolePill';
import type { Game } from '../types';

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
    }
  }, [user]);

  if (!user) return null;

  const downloads = (user.downloads || []).filter(
    (d): d is Game => typeof d === 'object' && d !== null && '_id' in d
  );

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await updateMe({ displayName, bio });
      await refresh();
      setSuccess(t('profile.saved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      await uploadAvatar(file);
      await refresh();
      setSuccess(t('profile.saved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleAvatarRemove() {
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      await deleteAvatar();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="container">
      <section className="profile">
        <header className="profile__header">
          <Avatar src={user.avatarUrl} name={user.displayName} email={user.email} size={84} />
          <div>
            <h1>{t('profile.title')}</h1>
            <p className="profile__email">{user.email}</p>
            <RolePill role={user.role} />
            <Link to={`/u/${user._id}`} className="profile__view-public">
              {t('profile.viewPublic')} →
            </Link>
          </div>
        </header>

        <section className="settings__group">
          <h2>{t('profile.avatar')}</h2>
          <div className="profile__avatar-row">
            <Avatar src={user.avatarUrl} name={user.displayName} email={user.email} size={64} />
            <div className="profile__avatar-actions">
              <label className="btn btn--ghost">
                {uploading ? t('profile.uploading') : t('profile.uploadAvatar')}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  hidden
                />
              </label>
              {user.avatarUrl ? (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={handleAvatarRemove}
                  disabled={uploading}
                >
                  {t('profile.removeAvatar')}
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="settings__group">
          <h2>{t('profile.editProfile')}</h2>
          <form onSubmit={handleSave} className="profile__edit">
            <label className="field">
              <span>{t('profile.displayName')}</span>
              <input
                type="text"
                value={displayName}
                maxLength={40}
                placeholder={t('profile.displayNamePlaceholder')}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </label>
            <label className="field">
              <span>{t('profile.bio')}</span>
              <textarea
                rows={3}
                value={bio}
                maxLength={280}
                placeholder={t('profile.bioPlaceholder')}
                onChange={(e) => setBio(e.target.value)}
              />
              <small className="field__hint">{bio.length} / 280</small>
            </label>
            {error ? <div className="error-banner">{error}</div> : null}
            {success ? <div className="success-banner">{success}</div> : null}
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? t('profile.saving') : t('profile.save')}
            </button>
          </form>
        </section>

        <section className="profile__downloads">
          <h2>{t('profile.history')}</h2>
          {downloads.length === 0 ? (
            <p className="empty-state">
              {t('profile.empty')} <Link to="/">{t('profile.browse')}</Link>.
            </p>
          ) : (
            <ul className="profile__list">
              {downloads.map((game) => (
                <li key={game._id} className="profile__item">
                  <Link to={`/game/${game._id}`} className="profile__item-link">
                    {game.coverUrl ? (
                      <img src={game.coverUrl} alt={game.title} />
                    ) : (
                      <div className="profile__item-placeholder">No cover</div>
                    )}
                    <div>
                      <h3>{game.title}</h3>
                      <p>{game.license}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </div>
  );
}
