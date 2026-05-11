import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import {
  listFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '../api/friends';
import { searchUsers } from '../api/users';
import { Avatar } from '../components/Avatar';
import { RolePill } from '../components/RolePill';
import type { FriendsPayload, PublicUser } from '../types';

export function FriendsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [data, setData] = useState<FriendsPayload | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await listFriends());
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  }, [t]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(() => {
      searchUsers(query.trim())
        .then((res) => {
          if (!cancelled) setResults(res.users);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="container">
        <p className="empty-state">{t('friends.notSignedIn')}</p>
      </div>
    );
  }

  const friendIdSet = new Set((data?.friends || []).map((f) => f._id));
  const outgoingIdSet = new Set((data?.requestsOutgoing || []).map((f) => f._id));
  const incomingIdSet = new Set((data?.requestsIncoming || []).map((f) => f._id));

  return (
    <div className="container">
      <section className="settings settings--wide">
        <header className="settings__header">
          <h1>{t('friends.title')}</h1>
        </header>

        <section className="settings__group">
          <h2>{t('friends.add')}</h2>
          <input
            type="search"
            className="lang-select"
            style={{ width: '100%', padding: '10px 12px' }}
            placeholder={t('friends.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="settings__hint" style={{ marginTop: 8 }}>
            {t('friends.searchHint')}
          </p>

          {results.length > 0 ? (
            <ul className="friend-list">
              {results.map((u) => {
                const isFriend = friendIdSet.has(u._id);
                const isOut = outgoingIdSet.has(u._id);
                const isIn = incomingIdSet.has(u._id);
                return (
                  <li key={u._id} className="friend-item">
                    <Link to={`/u/${u._id}`} className="friend-item__link">
                      <Avatar src={u.avatarUrl} name={u.displayName} email={u.email} size={40} />
                      <div>
                        <strong>{u.displayName || u.email.split('@')[0]}</strong>
                        <small>{u.email}</small>
                      </div>
                    </Link>
                    <div className="friend-item__actions">
                      <RolePill role={u.role} />
                      {isFriend ? (
                        <span className="badge">{t('friends.alreadyFriends')}</span>
                      ) : isOut ? (
                        <span className="badge">{t('friends.requestSent')}</span>
                      ) : isIn ? (
                        <button
                          type="button"
                          className="btn btn--primary btn--small"
                          disabled={busy}
                          onClick={() => act(() => acceptFriendRequest(u._id))}
                        >
                          {t('friends.accept')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn--primary btn--small"
                          disabled={busy}
                          onClick={() => act(() => sendFriendRequest(u._id))}
                        >
                          {t('friends.add')}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        {data?.requestsIncoming && data.requestsIncoming.length > 0 ? (
          <section className="settings__group">
            <h2>{t('friends.incoming')}</h2>
            <ul className="friend-list">
              {data.requestsIncoming.map((u) => (
                <li key={u._id} className="friend-item">
                  <Link to={`/u/${u._id}`} className="friend-item__link">
                    <Avatar src={u.avatarUrl} name={u.displayName} email={u.email} size={40} />
                    <div>
                      <strong>{u.displayName || u.email.split('@')[0]}</strong>
                      <small>{u.email}</small>
                    </div>
                  </Link>
                  <div className="friend-item__actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--small"
                      disabled={busy}
                      onClick={() => act(() => acceptFriendRequest(u._id))}
                    >
                      {t('friends.accept')}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost btn--small"
                      disabled={busy}
                      onClick={() => act(() => rejectFriendRequest(u._id))}
                    >
                      {t('friends.reject')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {data?.requestsOutgoing && data.requestsOutgoing.length > 0 ? (
          <section className="settings__group">
            <h2>{t('friends.outgoing')}</h2>
            <ul className="friend-list">
              {data.requestsOutgoing.map((u) => (
                <li key={u._id} className="friend-item">
                  <Link to={`/u/${u._id}`} className="friend-item__link">
                    <Avatar src={u.avatarUrl} name={u.displayName} email={u.email} size={40} />
                    <div>
                      <strong>{u.displayName || u.email.split('@')[0]}</strong>
                      <small>{u.email}</small>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="btn btn--ghost btn--small"
                    disabled={busy}
                    onClick={() => act(() => removeFriend(u._id))}
                  >
                    {t('friends.cancel')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="settings__group">
          <h2>{t('friends.list')}</h2>
          {data && data.friends.length === 0 ? (
            <p className="empty-state">{t('friends.empty')}</p>
          ) : (
            <ul className="friend-list">
              {(data?.friends || []).map((u) => (
                <li key={u._id} className="friend-item">
                  <Link to={`/u/${u._id}`} className="friend-item__link">
                    <Avatar src={u.avatarUrl} name={u.displayName} email={u.email} size={40} />
                    <div>
                      <strong>{u.displayName || u.email.split('@')[0]}</strong>
                      <small>{u.email}</small>
                    </div>
                  </Link>
                  <div className="friend-item__actions">
                    <Link className="btn btn--primary btn--small" to={`/chat/${u._id}`}>
                      {t('friends.message')}
                    </Link>
                    <button
                      type="button"
                      className="btn btn--ghost btn--small"
                      disabled={busy}
                      onClick={() => act(() => removeFriend(u._id))}
                    >
                      {t('friends.remove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {error ? <div className="error-banner">{error}</div> : null}
      </section>
    </div>
  );
}
