import { useEffect, useMemo, useState } from 'react';
import { listGames } from '../api/games';
import type { Game } from '../types';
import { GameCard } from '../components/GameCard';
import { Loader } from '../components/Loader';
import { useTranslation } from '../i18n/I18nContext';

export function CatalogPage() {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError(null);
    listGames()
      .then((res) => {
        if (!cancelled) setGames(res.games);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('catalog.failed'));
          setGames([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  const featured = useMemo(() => {
    if (!games || games.length === 0) return null;
    // Pick the highest-rated game with a cover, fall back to first
    const ranked = [...games].sort(
      (a, b) =>
        (b.ratingAvg || 0) * Math.log(1 + (b.ratingCount || 0)) -
        (a.ratingAvg || 0) * Math.log(1 + (a.ratingCount || 0))
    );
    return ranked[0] || null;
  }, [games]);

  const filtered = useMemo(() => {
    if (!games) return null;
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter(
      (g) => g.title.toLowerCase().includes(q) || g.license.toLowerCase().includes(q)
    );
  }, [games, query]);

  return (
    <div className="catalog">
      <div className="catalog__bg" aria-hidden="true">
        <div className="catalog__bg-blob catalog__bg-blob--a" />
        <div className="catalog__bg-blob catalog__bg-blob--b" />
        <div className="catalog__bg-grid" />
      </div>

      <div className="container catalog__inner">
        <section className="catalog-hero">
          <div className="catalog-hero__copy">
            <span className="catalog-hero__eyebrow">
              <span className="catalog-hero__dot" />
              {t('catalog.heroEyebrow')}
            </span>
            <h1 className="catalog-hero__title">{t('catalog.heroTitle')}</h1>
            <p className="catalog-hero__sub">{t('catalog.heroSubtitle')}</p>
            <ul className="catalog-hero__badges">
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Zm-1.1 14.4-3.8-3.8 1.4-1.4 2.4 2.4 5-5 1.4 1.4-6.4 6.4Z"
                  />
                </svg>
                {t('catalog.heroBadge1')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 1 3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4Zm0 6 4 4-4 4-4-4 4-4Z"
                  />
                </svg>
                {t('catalog.heroBadge2')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M5 20h14v-2H5v2Zm7-18-7 7h4v6h6v-6h4l-7-7Z"
                  />
                </svg>
                {t('catalog.heroBadge3')}
              </li>
            </ul>
          </div>

          {featured ? (
            <a className="catalog-hero__feature" href={`/game/${featured._id}`}>
              <div className="catalog-hero__feature-glow" aria-hidden="true" />
              <img
                src={featured.coverUrl}
                alt={featured.title}
                className="catalog-hero__feature-img"
                loading="eager"
              />
              <div className="catalog-hero__feature-meta">
                <span className="catalog-hero__feature-tag">Featured</span>
                <h3>{featured.title}</h3>
                <p>{featured.license}</p>
              </div>
            </a>
          ) : (
            <div className="catalog-hero__feature catalog-hero__feature--empty" aria-hidden="true">
              <div className="catalog-hero__feature-glow" />
            </div>
          )}
        </section>

        <section className="catalog-toolbar">
          <label className="catalog-search">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10 2a8 8 0 1 0 5 14.3l5.3 5.3 1.4-1.4-5.3-5.3A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
            />
          </label>
          <div className="catalog-toolbar__count">
            {games ? (
              <span>
                <strong>{filtered ? filtered.length : 0}</strong> / {games.length}
              </span>
            ) : null}
          </div>
        </section>

        {error ? <div className="error-banner">{error}</div> : null}

        {games === null ? (
          <Loader label={t('catalog.loading')} />
        ) : filtered && filtered.length === 0 ? (
          <div className="empty-state">
            <p>{games.length === 0 ? t('catalog.empty') : 'No matches.'}</p>
          </div>
        ) : (
          <div className="game-grid">
            {(filtered || []).map((game, i) => (
              <GameCard key={game._id} game={game} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
