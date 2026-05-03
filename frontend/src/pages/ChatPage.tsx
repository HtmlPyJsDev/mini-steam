import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import { listConversations, listMessages, sendMessage } from '../api/messages';
import { Avatar } from '../components/Avatar';
import type { ChatMessage, Conversation, PublicUser } from '../types';

export function ChatPage() {
  const { id: friendId } = useParams<{ id: string }>();
  const { user: me } = useAuth();
  const { t } = useTranslation();

  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [friend, setFriend] = useState<PublicUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await listConversations();
      setConversations(res.conversations);
    } catch {
      // ignore
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!friendId) return;
    try {
      const res = await listMessages(friendId);
      setFriend(res.friend);
      setMessages(res.messages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  }, [friendId, t]);

  useEffect(() => {
    if (me) void loadConversations();
  }, [me, loadConversations]);

  useEffect(() => {
    if (!friendId) return;
    void loadMessages();
    const id = setInterval(loadMessages, 5000);
    return () => clearInterval(id);
  }, [friendId, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!friendId || !text.trim()) return;
    setSending(true);
    try {
      await sendMessage(friendId, text.trim());
      setText('');
      await loadMessages();
      void loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSending(false);
    }
  }

  if (!me) {
    return (
      <div className="container">
        <p className="empty-state">{t('friends.notSignedIn')}</p>
      </div>
    );
  }

  return (
    <div className="container chat-shell">
      <aside className="chat-sidebar">
        <h2>{t('chat.title')}</h2>
        {conversations && conversations.length === 0 ? (
          <p className="empty-state">{t('chat.noConversations')}</p>
        ) : (
          <ul className="conversation-list">
            {(conversations || []).map((c) => (
              <li key={c.friend._id}>
                <Link
                  to={`/chat/${c.friend._id}`}
                  className={`conversation-item${friendId === c.friend._id ? ' is-active' : ''}`}
                >
                  <Avatar
                    src={c.friend.avatarUrl}
                    name={c.friend.displayName}
                    email={c.friend.email}
                    size={36}
                  />
                  <div className="conversation-item__body">
                    <strong>{c.friend.displayName || c.friend.email.split('@')[0]}</strong>
                    <small>
                      {c.lastMessage
                        ? c.lastMessage.text.slice(0, 50)
                        : t('chat.empty')}
                    </small>
                  </div>
                  {c.unread > 0 ? <span className="badge badge--accent">{c.unread}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="chat-main">
        {friendId ? (
          friend ? (
            <>
              <header className="chat-header">
                <Link to={`/u/${friend._id}`} className="chat-header__link">
                  <Avatar
                    src={friend.avatarUrl}
                    name={friend.displayName}
                    email={friend.email}
                    size={40}
                  />
                  <div>
                    <strong>{friend.displayName || friend.email.split('@')[0]}</strong>
                    <small>{friend.email}</small>
                  </div>
                </Link>
              </header>
              <div className="chat-messages" ref={scrollRef}>
                {messages.length === 0 ? (
                  <p className="empty-state">{t('chat.empty')}</p>
                ) : (
                  messages.map((m) => {
                    const mine = m.from === me._id;
                    return (
                      <div key={m._id} className={`chat-bubble${mine ? ' chat-bubble--mine' : ''}`}>
                        <div className="chat-bubble__text">{m.text}</div>
                        <div className="chat-bubble__time">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {error ? <div className="error-banner">{error}</div> : null}
              <form className="chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  maxLength={2000}
                />
                <button type="submit" className="btn btn--primary" disabled={sending || !text.trim()}>
                  {t('chat.send')}
                </button>
              </form>
            </>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : (
            <p>{t('common.loading')}</p>
          )
        ) : (
          <p className="empty-state">{t('chat.openChat')}</p>
        )}
      </section>
    </div>
  );
}
