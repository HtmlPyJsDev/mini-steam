import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import { Avatar } from './Avatar';
import {
  heartbeat,
  listOnline,
  listGlobalMessages,
  sendGlobalMessage,
  listGroups,
  createGroup,
} from '../api/social';
import { searchUsers } from '../api/users';
import type { GlobalChatMessage, GroupChat, PublicUser } from '../types';

const STORAGE_OPEN_KEY = 'uzisoft_dock_open';
const STORAGE_TAB_KEY = 'uzisoft_dock_tab';

type DockTab = 'chat' | 'online' | 'groups';

function timeAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '';
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function ChatDock() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem(STORAGE_OPEN_KEY);
    return stored === null ? true : stored === '1';
  });
  const [tab, setTab] = useState<DockTab>(() => {
    if (typeof window === 'undefined') return 'chat';
    const stored = window.localStorage.getItem(STORAGE_TAB_KEY);
    if (stored === 'chat' || stored === 'online' || stored === 'groups') return stored;
    return 'chat';
  });

  const [globalMessages, setGlobalMessages] = useState<GlobalChatMessage[]>([]);
  const [globalText, setGlobalText] = useState('');
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState<PublicUser[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupQuery, setGroupQuery] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState<PublicUser[]>([]);
  const [groupSelected, setGroupSelected] = useState<PublicUser[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesScrollRef = useRef<HTMLDivElement | null>(null);

  // Persist state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_OPEN_KEY, open ? '1' : '0');
    }
  }, [open]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_TAB_KEY, tab);
    }
  }, [tab]);

  // Heartbeat + initial load
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const beat = () => {
      heartbeat().catch(() => {});
    };
    beat();
    const id = window.setInterval(beat, 45000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      void cancelled;
    };
  }, [user]);

  // Poll online users
  useEffect(() => {
    if (!user || !open) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await listOnline();
        if (!cancelled) setOnline(data.users);
      } catch {
        /* ignore */
      }
    };
    void tick();
    const id = window.setInterval(tick, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user, open]);

  // Poll global chat (only when chat tab visible)
  useEffect(() => {
    if (!user || !open || tab !== 'chat') return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await listGlobalMessages();
        if (!cancelled) setGlobalMessages(data.messages);
      } catch {
        /* ignore */
      }
    };
    void tick();
    const id = window.setInterval(tick, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user, open, tab]);

  // Poll groups list when on groups tab
  useEffect(() => {
    if (!user || !open || tab !== 'groups') return;
    let cancelled = false;
    const tick = async () => {
      try {
        const data = await listGroups();
        if (!cancelled) setGroups(data.groups);
      } catch {
        /* ignore */
      }
    };
    void tick();
    const id = window.setInterval(tick, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user, open, tab]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (tab === 'chat' && messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, [globalMessages, tab]);

  // Group member search
  useEffect(() => {
    if (!showCreateGroup || groupQuery.trim().length < 2) {
      setGroupSearchResults([]);
      return;
    }
    let cancelled = false;
    const id = window.setTimeout(async () => {
      try {
        const data = await searchUsers(groupQuery.trim());
        if (!cancelled) setGroupSearchResults(data.users);
      } catch {
        if (!cancelled) setGroupSearchResults([]);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [showCreateGroup, groupQuery]);

  const handleSendGlobal = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = globalText.trim();
      if (!text || sending) return;
      setSending(true);
      setError(null);
      try {
        const res = await sendGlobalMessage(text);
        setGlobalMessages((prev) => [...prev, res.message]);
        setGlobalText('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send');
      } finally {
        setSending(false);
      }
    },
    [globalText, sending]
  );

  const handleCreateGroup = useCallback(async () => {
    const name = groupName.trim();
    if (!name) {
      setError(t('dock.groups.nameRequired'));
      return;
    }
    setCreatingGroup(true);
    setError(null);
    try {
      const memberIds = groupSelected.map((u) => u._id);
      const res = await createGroup(name, memberIds);
      setGroups((prev) => [res.group, ...prev.filter((g) => g._id !== res.group._id)]);
      setShowCreateGroup(false);
      setGroupName('');
      setGroupSelected([]);
      setGroupQuery('');
      setGroupSearchResults([]);
      navigate(`/chat?group=${res.group._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  }, [groupName, groupSelected, navigate, t]);

  const onPickGroup = (g: GroupChat) => {
    navigate(`/chat?group=${g._id}`);
  };

  const onPickOnlineUser = (u: PublicUser) => {
    navigate(`/u/${u._id}`);
  };

  const onlineCount = online.length;

  const isAuthRoute = useMemo(
    () => /^\/(login|register)$/.test(location.pathname),
    [location.pathname]
  );

  if (!user) return null;
  if (isAuthRoute) return null;

  return (
    <aside className={`dock ${open ? 'dock--open' : 'dock--closed'}`}>
      <button
        type="button"
        className="dock__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Collapse dock' : 'Expand dock'}
        title={open ? t('dock.collapse') : t('dock.expand')}
      >
        {open ? '◀' : '▶'}
      </button>
      {open ? (
        <div className="dock__inner">
          <header className="dock__header">
            <div className="dock__title">
              <span className="dock__pulse" aria-hidden />
              <span>{t('dock.title')}</span>
            </div>
            <span className="dock__online-count" title={t('dock.onlineNow')}>
              {onlineCount} {t('dock.onlineWord')}
            </span>
          </header>
          <nav className="dock__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className={`dock__tab ${tab === 'chat' ? 'is-active' : ''}`}
              onClick={() => setTab('chat')}
            >
              💬 {t('dock.tab.chat')}
            </button>
            <button
              type="button"
              role="tab"
              className={`dock__tab ${tab === 'online' ? 'is-active' : ''}`}
              onClick={() => setTab('online')}
            >
              🟢 {t('dock.tab.online')}
            </button>
            <button
              type="button"
              role="tab"
              className={`dock__tab ${tab === 'groups' ? 'is-active' : ''}`}
              onClick={() => setTab('groups')}
            >
              👥 {t('dock.tab.groups')}
            </button>
          </nav>

          {error ? <div className="dock__error">{error}</div> : null}

          {tab === 'chat' ? (
            <div className="dock__panel dock__panel--chat">
              <div className="dock__messages" ref={messagesScrollRef}>
                {globalMessages.length === 0 ? (
                  <div className="dock__empty">{t('dock.chat.empty')}</div>
                ) : (
                  globalMessages.map((m) => (
                    <div key={m._id} className="dock-msg">
                      <Avatar
                        size={28}
                        src={m.from?.avatarUrl}
                        name={m.from?.displayName}
                        email={m.from?.email}
                      />
                      <div className="dock-msg__body">
                        <div className="dock-msg__head">
                          {m.from ? (
                            <Link to={`/u/${m.from._id}`} className="dock-msg__name">
                              {m.from.displayName || m.from.email.split('@')[0]}
                            </Link>
                          ) : (
                            <span className="dock-msg__name">…</span>
                          )}
                          {m.from?.role && m.from.role !== 'user' ? (
                            <span className={`dock-msg__role dock-msg__role--${m.from.role}`}>
                              {m.from.role}
                            </span>
                          ) : null}
                          <span className="dock-msg__time">{timeAgo(m.createdAt)}</span>
                        </div>
                        <div className="dock-msg__text">{m.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form className="dock__compose" onSubmit={handleSendGlobal}>
                <input
                  type="text"
                  className="dock__input"
                  placeholder={t('dock.chat.placeholder')}
                  value={globalText}
                  onChange={(e) => setGlobalText(e.target.value)}
                  maxLength={600}
                />
                <button
                  type="submit"
                  className="btn btn--primary dock__send"
                  disabled={sending || globalText.trim().length === 0}
                >
                  {sending ? '…' : '➤'}
                </button>
              </form>
            </div>
          ) : null}

          {tab === 'online' ? (
            <div className="dock__panel dock__panel--online">
              {online.length === 0 ? (
                <div className="dock__empty">{t('dock.online.empty')}</div>
              ) : (
                <ul className="dock__user-list">
                  {online.map((u) => (
                    <li key={u._id}>
                      <button
                        type="button"
                        className="dock-user"
                        onClick={() => onPickOnlineUser(u)}
                      >
                        <span className="dock-user__avatar">
                          <Avatar size={32} src={u.avatarUrl} name={u.displayName} email={u.email} />
                          <span className="dock-user__pulse" />
                        </span>
                        <span className="dock-user__body">
                          <span className="dock-user__name">
                            {u.displayName || u.email.split('@')[0]}
                          </span>
                          {u.role && u.role !== 'user' ? (
                            <span className={`dock-msg__role dock-msg__role--${u.role}`}>
                              {u.role}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {tab === 'groups' ? (
            <div className="dock__panel dock__panel--groups">
              <button
                type="button"
                className="btn btn--primary dock__cta"
                onClick={() => {
                  setShowCreateGroup(true);
                  setError(null);
                }}
              >
                + {t('dock.groups.create')}
              </button>
              {groups.length === 0 ? (
                <div className="dock__empty">{t('dock.groups.empty')}</div>
              ) : (
                <ul className="dock__user-list">
                  {groups.map((g) => (
                    <li key={g._id}>
                      <button type="button" className="dock-user" onClick={() => onPickGroup(g)}>
                        <span className="dock-user__avatar">
                          <span className="dock-group-icon">👥</span>
                        </span>
                        <span className="dock-user__body">
                          <span className="dock-user__name">{g.name}</span>
                          <span className="dock-user__meta">
                            {g.members.length} {t('dock.groups.members')}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {showCreateGroup ? (
            <div
              className="dock__modal"
              role="dialog"
              aria-label={t('dock.groups.createTitle')}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowCreateGroup(false);
              }}
            >
              <div className="dock__modal-card">
                <header className="dock__modal-head">
                  <h3>{t('dock.groups.createTitle')}</h3>
                  <button
                    type="button"
                    className="dock__close"
                    onClick={() => setShowCreateGroup(false)}
                    aria-label="close"
                  >
                    ×
                  </button>
                </header>
                <label className="dock__field">
                  <span>{t('dock.groups.nameLabel')}</span>
                  <input
                    className="dock__input"
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    maxLength={60}
                    placeholder={t('dock.groups.namePlaceholder')}
                  />
                </label>
                <label className="dock__field">
                  <span>{t('dock.groups.searchLabel')}</span>
                  <input
                    className="dock__input"
                    type="text"
                    value={groupQuery}
                    onChange={(e) => setGroupQuery(e.target.value)}
                    placeholder={t('dock.groups.searchPlaceholder')}
                  />
                </label>
                {groupSearchResults.length > 0 ? (
                  <ul className="dock__search-list">
                    {groupSearchResults
                      .filter((u) => !groupSelected.some((s) => s._id === u._id))
                      .map((u) => (
                        <li key={u._id}>
                          <button
                            type="button"
                            className="dock-user"
                            onClick={() => {
                              setGroupSelected((prev) => [...prev, u]);
                              setGroupQuery('');
                              setGroupSearchResults([]);
                            }}
                          >
                            <Avatar
                              size={28}
                              src={u.avatarUrl}
                              name={u.displayName}
                              email={u.email}
                            />
                            <span className="dock-user__name">
                              {u.displayName || u.email.split('@')[0]}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                ) : null}
                {groupSelected.length > 0 ? (
                  <div className="dock__chips">
                    {groupSelected.map((u) => (
                      <span key={u._id} className="dock__chip">
                        {u.displayName || u.email.split('@')[0]}
                        <button
                          type="button"
                          onClick={() =>
                            setGroupSelected((prev) => prev.filter((s) => s._id !== u._id))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                <footer className="dock__modal-foot">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowCreateGroup(false)}
                  >
                    {t('dock.cancel')}
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={handleCreateGroup}
                    disabled={creatingGroup || !groupName.trim()}
                  >
                    {creatingGroup ? '…' : t('dock.groups.createConfirm')}
                  </button>
                </footer>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
