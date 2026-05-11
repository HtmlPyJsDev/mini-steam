import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGame, requestDownload, buyGame } from '../api/games';
import { listGameUpdates } from '../api/social';
import type { DevUpdate, Game } from '../types';
import { Loader } from '../components/Loader';
import { StarRating } from '../components/StarRating';
import { GameReviews } from '../components/GameReviews';
import { FpsEstimator } from '../components/FpsEstimator';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { user, refresh } = useAuth();
  const { t } = useTranslation();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeShot, setActiveShot] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [buying, setBuying] = useState<boolean>(false);
  const [updates, setUpdates] = useState<DevUpdate[]>([]);

  const ownership = useMemo(() => {
    if (!user || !game) {
      return { owned: false, isAuthor: false, isAdmin: false, isPaid: false };
    }
    const ownedIds = (user.downloads || []).map((d) => (typeof d === 'string' ? d : d._id));
    const owned = ownedIds.includes(game._id);
    const uploader = game.uploaderId;
    const uploaderId =
      typeof uploader === 'string' ? uploader : uploader?._id ?? null;
    return {
      owned,
      isAuthor: uploaderId === user._id,
      isAdmin: user.role === 'admin',
      isPaid: !!(game.priceUzis && game.priceUzis > 0),
    };
  }, [user, game]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    setGame(null);
    getGame(id)
      .then((res) => {
        if (!cancelled) {
          setGame(res.game);
          setActiveShot(res.game.screenshots[0] || null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t('game.failed'));
      });
    listGameUpdates(id)
      .then((res) => {
        if (!cancelled) setUpdates(res.updates);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, t]);

  async function handleDownload() {
    if (!id) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await requestDownload(id);
      window.open(res.url, '_blank', 'noopener,noreferrer');
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('game.downloadFailed'));
    } finally {
      setDownloading(false);
    }
  }

  async function handleBuy() {
    if (!id) return;
    setBuying(true);
    setError(null);
    try {
      await buyGame(id);
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.error');
      if (msg.includes('INSUFFICIENT_UZIS')) {
        setError(t('game.notEnoughUzis'));
      } else {
        setError(msg);
      }
    } finally {
      setBuying(false);
    }
  }

  if (!game) {
    return (
      <div className="container">
        {error ? <div className="error-banner">{error}</div> : <Loader label={t('game.loading')} />}
      </div>
    );
  }

  return (
    <div className="container">
      <article className="game-detail">
        <div className="game-detail__hero">
          <div className="game-detail__cover">
            <img src={activeShot || game.coverUrl} alt={game.title} />
          </div>
          <div className="game-detail__meta">
            <h1 className="game-detail__title">{game.title}</h1>
            {game.ratingCount && game.ratingCount > 0 ? (
              <div className="game-detail__rating">
                <StarRating value={game.ratingAvg ?? 0} size={20} />
                <strong>{(game.ratingAvg ?? 0).toFixed(1)}</strong>
                <span className="game-detail__rating-count">
                  {game.ratingCount} {t('reviews.countSuffix')}
                </span>
              </div>
            ) : null}
            <dl className="game-detail__facts">
              <div>
                <dt>{t('game.license')}</dt>
                <dd>{game.license}</dd>
              </div>
              <div>
                <dt>{t('game.fileSize')}</dt>
                <dd>{formatBytes(game.size)}</dd>
              </div>
            </dl>

            {user ? (
              <div className="game-detail__actions">
                <div className="game-detail__price-row">
                  {ownership.isPaid ? (
                    <span className="game-detail__price game-detail__price--paid">
                      <span aria-hidden="true">⌬</span>
                      {game.priceUzis}
                    </span>
                  ) : (
                    <span className="game-detail__price game-detail__price--free">
                      {t('developer.priceFree')}
                    </span>
                  )}
                  {ownership.owned ? (
                    <span className="owned-badge">✓ {t('game.owned')}</span>
                  ) : null}
                  {ownership.isAuthor ? (
                    <span className="owned-badge owned-badge--author">★ {t('game.yourGame')}</span>
                  ) : null}
                </div>
                {ownership.isPaid && !ownership.owned && !ownership.isAuthor && !ownership.isAdmin ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--large"
                    onClick={handleBuy}
                    disabled={buying}
                  >
                    {buying
                      ? t('game.buying')
                      : `${t('game.buyForUzis').replace('{price}', String(game.priceUzis))}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary btn--large"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? t('game.preparingLink') : t('game.download')}
                  </button>
                )}
              </div>
            ) : (
              <div className="auth-cta">
                <p>{t('game.signInToDownload')}</p>
                <div className="auth-cta__actions">
                  <Link to="/login" className="btn btn--primary">
                    {t('nav.signIn')}
                  </Link>
                  <Link to="/register" className="btn btn--ghost">
                    {t('nav.register')}
                  </Link>
                </div>
              </div>
            )}

            {error ? <div className="error-banner">{error}</div> : null}
          </div>
        </div>

        {game.screenshots.length > 0 ? (
          <section className="game-detail__shots">
            <h2>{t('game.screenshots')}</h2>
            <div className="screenshot-strip">
              {game.screenshots.map((url) => (
                <button
                  type="button"
                  key={url}
                  className={`screenshot-strip__item${activeShot === url ? ' is-active' : ''}`}
                  onClick={() => setActiveShot(url)}
                >
                  <img src={url} alt="screenshot" loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="game-detail__about">
          <h2>{t('game.about')}</h2>
          <p>{game.description}</p>
        </section>

        <FpsEstimator gameTier={game.gpuTier ?? 0} />

        {updates.length > 0 ? (
          <section className="game-detail__about">
            <h2>{t('game.updatesTitle')}</h2>
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
                      {u.authorId ? (
                        <Link to={`/u/${u.authorId._id}`} className="update-card__author">
                          <Avatar
                            size={28}
                            src={u.authorId.avatarUrl}
                            name={u.authorId.displayName}
                            email={u.authorId.email}
                          />
                          <span>
                            {u.authorId.displayName || u.authorId.email.split('@')[0]}
                          </span>
                        </Link>
                      ) : null}
                      <span className="update-card__time">
                        {new Date(u.createdAt).toLocaleString()}
                      </span>
                    </header>
                    <p className="update-card__caption">{u.caption}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <GameReviews gameId={game._id} />
      </article>
    </div>
  );
}
