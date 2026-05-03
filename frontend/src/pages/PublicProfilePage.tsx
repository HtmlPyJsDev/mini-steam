import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import { getPublicUser } from '../api/users';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '../api/friends';
import { Avatar } from '../components/Avatar';
import { RolePill } from '../components/RolePill';
import type { PublicProfile, Relation } from '../types';

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [relation, setRelation] = useState<Relation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!id) return;
    setError(null);
    try {
      const res = await getPublicUser(id);
      setProfile(res.user);
      setRelation(res.relation);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.notFound'));
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  if (!profile) {
    return (
      <div className="container">
        {error ? <div className="error-banner">{error}</div> : <p>{t('common.loading')}</p>}
      </div>
    );
  }

  const canChat = !!me && relation?.isFriend;

  return (
    <div className="container">
      <section className="profile">
        <header className="profile__header">
          <Avatar
            src={profile.avatarUrl}
            name={profile.displayName}
            email={profile.email}
            size={84}
          />
          <div>
            <h1>{profile.displayName || profile.email.split('@')[0]}</h1>
            <p className="profile__email">{profile.email}</p>
            <RolePill role={profile.role} />
            {profile.banned ? (
              <span className="badge badge--danger" style={{ marginLeft: 8 }}>
                {t('admin.userBanned')}
              </span>
            ) : null}
          </div>
        </header>

        {profile.bio ? (
          <section className="settings__group">
            <p className="profile__bio">{profile.bio}</p>
          </section>
        ) : null}

        <section className="settings__group">
          <ul className="settings__account">
            <li>
              <span>{t('profile.friendsCount')}</span>
              <strong>{profile.friendsCount}</strong>
            </li>
            {profile.createdAt ? (
              <li>
                <span>{t('profile.memberSince')}</span>
                <strong>{new Date(profile.createdAt).toLocaleDateString()}</strong>
              </li>
            ) : null}
          </ul>
        </section>

        {profile.developerGame && profile.developerGame.status === 'approved' ? (
          <section className="settings__group">
            <h2>{t('profile.developerGame')}</h2>
            <Link to={`/game/${profile.developerGame._id}`} className="profile__item-link">
              {profile.developerGame.coverUrl ? (
                <img src={profile.developerGame.coverUrl} alt={profile.developerGame.title} />
              ) : null}
              <div>
                <h3>{profile.developerGame.title}</h3>
                <p>{profile.developerGame.license}</p>
              </div>
            </Link>
          </section>
        ) : null}

        {me && !relation?.isMe ? (
          <section className="settings__group">
            <div className="profile__friend-actions">
              {relation?.isFriend ? (
                <>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => navigate(`/chat/${profile._id}`)}
                  >
                    {canChat ? t('friends.message') : t('chat.notFriends')}
                  </button>
                  <button
                    type="button"
                    className="btn btn--danger"
                    disabled={busy}
                    onClick={() => action(() => removeFriend(profile._id))}
                  >
                    {t('friends.remove')}
                  </button>
                </>
              ) : relation?.requestIncoming ? (
                <>
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={busy}
                    onClick={() => action(() => acceptFriendRequest(profile._id))}
                  >
                    {t('friends.accept')}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={busy}
                    onClick={() => action(() => rejectFriendRequest(profile._id))}
                  >
                    {t('friends.reject')}
                  </button>
                </>
              ) : relation?.requestOutgoing ? (
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={busy}
                  onClick={() => action(() => removeFriend(profile._id))}
                >
                  {t('friends.cancel')} · {t('friends.requestSent')}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={busy || profile.banned}
                  onClick={() => action(() => sendFriendRequest(profile._id))}
                >
                  {t('friends.add')}
                </button>
              )}
            </div>
            {error ? <div className="error-banner">{error}</div> : null}
          </section>
        ) : null}
      </section>
    </div>
  );
}
