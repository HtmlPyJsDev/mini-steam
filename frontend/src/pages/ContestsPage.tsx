import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import { Avatar } from '../components/Avatar';
import {
  awardContest,
  createContest,
  deleteContest,
  getContest,
  joinContest,
  leaveContest,
  listContests,
} from '../api/uzis';
import type { Contest, PublicUser } from '../types';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return '0';
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function ContestCard({
  contest,
  isAdmin,
  onJoin,
  onLeave,
  onDelete,
  busyId,
}: {
  contest: Contest;
  isAdmin: boolean;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onDelete: (id: string) => void;
  busyId: string | null;
}) {
  const { t } = useTranslation();
  const ended = new Date(contest.endsAt).getTime() <= Date.now();
  const closed = contest.status === 'closed';
  return (
    <article className="contest-card">
      <header className="contest-card__head">
        <h3>
          <Link to={`/contests/${contest._id}`} className="contest-card__title-link">
            {contest.title}
          </Link>
        </h3>
        <span className="contest-card__prize">
          ⌬ {contest.prize.toLocaleString()}
        </span>
      </header>
      {contest.description && (
        <p className="contest-card__desc">{contest.description}</p>
      )}
      <div className="contest-card__meta">
        <span>👥 {contest.participantsCount}</span>
        <span>
          {closed
            ? t('contests.closed')
            : ended
              ? t('contests.ended')
              : `⏳ ${timeLeft(contest.endsAt)}`}
        </span>
        <span>{fmtDate(contest.endsAt)}</span>
      </div>
      <div className="contest-card__actions">
        {!closed && !ended && (
          <>
            {contest.isParticipant ? (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => onLeave(contest._id)}
                disabled={busyId === contest._id}
              >
                {t('contests.leave')}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => onJoin(contest._id)}
                disabled={busyId === contest._id}
              >
                {t('contests.join')}
              </button>
            )}
          </>
        )}
        <Link to={`/contests/${contest._id}`} className="btn btn--ghost">
          {t('contests.open')}
        </Link>
        {isAdmin && !closed && (
          <button
            type="button"
            className="btn btn--ghost contest-card__delete"
            onClick={() => onDelete(contest._id)}
          >
            {t('common.delete')}
          </button>
        )}
      </div>
    </article>
  );
}

export function ContestsListPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createPrize, setCreatePrize] = useState<number>(100);
  const [createEnd, setCreateEnd] = useState('');
  const [creating, setCreating] = useState(false);

  const reload = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const { contests: list } = await listContests(activeTab);
        setContests(list);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onJoin(id: string) {
    setBusyId(id);
    try {
      const res = await joinContest(id);
      setContests((arr) => arr.map((c) => (c._id === id ? res.contest : c)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function onLeave(id: string) {
    setBusyId(id);
    try {
      const res = await leaveContest(id);
      setContests((arr) => arr.map((c) => (c._id === id ? res.contest : c)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm(t('contests.confirmDelete'))) return;
    setBusyId(id);
    try {
      await deleteContest(id);
      setContests((arr) => arr.filter((c) => c._id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!createTitle.trim() || createPrize < 1 || !createEnd) return;
    setCreating(true);
    setError(null);
    try {
      const endsAt = new Date(createEnd).toISOString();
      await createContest({
        title: createTitle.trim(),
        description: createDesc.trim(),
        prize: Math.floor(createPrize),
        endsAt,
      });
      setCreateTitle('');
      setCreateDesc('');
      setCreatePrize(100);
      setCreateEnd('');
      setShowCreate(false);
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="container">
      <section className="contests-page">
        <header className="contests-page__head">
          <div>
            <h1>{t('contests.title')}</h1>
            <p className="contests-page__sub">{t('contests.subtitle')}</p>
          </div>
          {isAdmin && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setShowCreate((v) => !v)}
            >
              {showCreate ? t('contests.hideForm') : t('contests.createButton')}
            </button>
          )}
        </header>

        {showCreate && isAdmin && (
          <form className="contests-page__form" onSubmit={handleCreate}>
            <label>
              <span>{t('contests.formTitle')}</span>
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                maxLength={120}
                required
              />
            </label>
            <label>
              <span>{t('contests.formDesc')}</span>
              <textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </label>
            <div className="contests-page__form-row">
              <label>
                <span>{t('contests.formPrize')}</span>
                <input
                  type="number"
                  min={1}
                  max={1000000}
                  value={createPrize}
                  onChange={(e) => setCreatePrize(Number(e.target.value) || 0)}
                  required
                />
              </label>
              <label>
                <span>{t('contests.formEnds')}</span>
                <input
                  type="datetime-local"
                  value={createEnd}
                  onChange={(e) => setCreateEnd(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="contests-page__form-actions">
              <button type="submit" className="btn btn--primary" disabled={creating}>
                {creating ? t('contests.creating') : t('contests.createConfirm')}
              </button>
            </div>
          </form>
        )}

        <div className="contests-page__tabs">
          <button
            type="button"
            className={activeTab === 'active' ? 'is-active' : ''}
            onClick={() => setActiveTab('active')}
          >
            {t('contests.tabActive')}
          </button>
          <button
            type="button"
            className={activeTab === 'closed' ? 'is-active' : ''}
            onClick={() => setActiveTab('closed')}
          >
            {t('contests.tabClosed')}
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p>{t('common.loading')}</p>
        ) : contests.length === 0 ? (
          <p className="empty-state">{t('contests.empty')}</p>
        ) : (
          <div className="contests-grid">
            {contests.map((c) => (
              <ContestCard
                key={c._id}
                contest={c}
                isAdmin={isAdmin}
                onJoin={onJoin}
                onLeave={onLeave}
                onDelete={onDelete}
                busyId={busyId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function ContestDetailPage() {
  const { user, refresh } = useAuth();
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const id = params.id || '';
  const isAdmin = user?.role === 'admin';
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWinners, setSelectedWinners] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  async function reload() {
    if (!id) return;
    setLoading(true);
    try {
      const { contest: c } = await getContest(id);
      setContest(c);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleJoin() {
    setBusy(true);
    try {
      const res = await joinContest(id);
      setContest((c) => (c ? { ...c, ...res.contest } : c));
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    setBusy(true);
    try {
      const res = await leaveContest(id);
      setContest((c) => (c ? { ...c, ...res.contest } : c));
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function toggleWinner(uid: string) {
    setSelectedWinners((s) => {
      const next = new Set(s);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  async function handleAward() {
    if (selectedWinners.size === 0) return;
    if (!window.confirm(t('contests.confirmAward'))) return;
    setBusy(true);
    try {
      await awardContest(id, Array.from(selectedWinners));
      setSelectedWinners(new Set());
      await refresh();
      await reload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !contest) {
    return (
      <div className="container">
        <p>{loading ? t('common.loading') : (error ?? t('contests.notFound'))}</p>
      </div>
    );
  }

  const ended = new Date(contest.endsAt).getTime() <= Date.now();
  const closed = contest.status === 'closed';

  return (
    <div className="container">
      <article className="contest-detail">
        <header className="contest-detail__head">
          <Link to="/contests" className="contest-detail__back">
            ← {t('contests.backToList')}
          </Link>
          <h1>{contest.title}</h1>
          <div className="contest-detail__meta">
            <span className="contest-detail__prize">⌬ {contest.prize.toLocaleString()}</span>
            <span>{closed ? t('contests.closed') : ended ? t('contests.ended') : t('contests.active')}</span>
            <span>
              {t('contests.endsAt')}: {fmtDate(contest.endsAt)}
            </span>
          </div>
        </header>
        {contest.description && (
          <p className="contest-detail__desc">{contest.description}</p>
        )}

        {error && <div className="error-banner">{error}</div>}

        {!closed && !ended && user ? (
          <div className="contest-detail__actions">
            {contest.isParticipant ? (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleLeave}
                disabled={busy}
              >
                {t('contests.leave')}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleJoin}
                disabled={busy}
              >
                {t('contests.join')}
              </button>
            )}
          </div>
        ) : null}

        <section className="contest-detail__section">
          <h2>
            {t('contests.participants')} ({contest.participants?.length ?? 0})
          </h2>
          {(contest.participants ?? []).length === 0 ? (
            <p className="empty-state">{t('contests.noParticipants')}</p>
          ) : (
            <ul className="contest-detail__participants">
              {(contest.participants ?? []).map((p: PublicUser) => {
                const isWinner = (contest.winners ?? []).some((w) => w._id === p._id);
                return (
                  <li
                    key={p._id}
                    className={`contest-participant${isWinner ? ' is-winner' : ''}`}
                  >
                    <Avatar
                      src={p.avatarUrl}
                      name={p.displayName}
                      email={p.email}
                      size={36}
                    />
                    <Link to={`/u/${p._id}`} className="contest-participant__name">
                      {p.displayName || p.email}
                    </Link>
                    {isWinner && (
                      <span className="contest-participant__badge">🏆 {t('contests.winner')}</span>
                    )}
                    {isAdmin && !closed && ended && !isWinner && (
                      <label className="contest-participant__select">
                        <input
                          type="checkbox"
                          checked={selectedWinners.has(p._id)}
                          onChange={() => toggleWinner(p._id)}
                        />
                        <span>{t('contests.selectWinner')}</span>
                      </label>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {isAdmin && !closed && ended && (
          <div className="contest-detail__award">
            <p>{t('contests.adminAwardHint')}</p>
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy || selectedWinners.size === 0}
              onClick={handleAward}
            >
              {t('contests.awardButton')} ({selectedWinners.size})
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
