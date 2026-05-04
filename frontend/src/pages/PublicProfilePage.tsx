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
import {
  subscribe as subscribeUser,
  unsubscribe as unsubscribeUser,
  listUserUpdates,
  deleteUpdate,
} from '../api/social';
import { Avatar } from '../components/Avatar';
import { RolePill } from '../components/RolePill';
import type { DevUpdate, PublicProfile, Relation } from '../types';

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [relation, setRelation] = useState<Relation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [updates, setUpdates] = useState<DevUpdate[]>([]);

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

  async function loadUpdates() {
    if (!id) return;
    try {
      const res = await listUserUpdates(id);
      setUpdates(res.updates);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    void load();
    void loadUpdates();
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
            {profile.role === 'developer' || (profile.subscribersCount ?? 0) > 0 ? (
              <li>
                <span>{t('profile.subscribersCount')}</span>
                <strong>{profile.subscribersCount ?? 0}</strong>
              </li>
            ) : null}
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
              {profile.role === 'developer' ? (
                relation?.isSubscribed ? (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={busy}
                    onClick={() => action(() => unsubscribeUser(profile._id))}
                  >
                    ★ {t('profile.unsubscribe')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={busy}
                    onClick={() => action(() => subscribeUser(profile._id))}
                  >
                    ☆ {t('profile.subscribe')}
                  </button>
                )
              ) : null}
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

        {updates.length > 0 ? (
          <section className="settings__group">
            <h2>{t('profile.updatesTitle')}</h2>
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
                      <Link to={`/u/${u.authorId?._id || profile._id}`} className="update-card__author">
                        <Avatar
                          size={28}
                          src={u.authorId?.avatarUrl}
                          name={u.authorId?.displayName}
                          email={u.authorId?.email}
                        />
                        <span>
                          {u.authorId?.displayName || u.authorId?.email.split('@')[0] || ''}
                        </span>
                      </Link>
                      <span className="update-card__time">
                        {new Date(u.createdAt).toLocaleString()}
                      </span>
                    </header>
                    <p className="update-card__caption">{u.caption}</p>
                    {u.gameId ? (
                      <Link to={`/game/${u.gameId._id}`} className="update-card__game">
                        🎮 {u.gameId.title}
                      </Link>
                    ) : null}
                    {me && (me._id === (u.authorId?._id || '') || me.role === 'admin') ? (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={async () => {
                          await deleteUpdate(u._id);
                          await loadUpdates();
                        }}
                      >
                        {t('common.delete')}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
