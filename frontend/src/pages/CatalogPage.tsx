import { useEffect, useState } from 'react';
import { listGames } from '../api/games';
import type { Game } from '../types';
import { GameCard } from '../components/GameCard';
import { Loader } from '../components/Loader';
import { useTranslation } from '../i18n/I18nContext';

export function CatalogPage() {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container">
      <section className="hero">
        <h1 className="hero__title">{t('catalog.heroTitle')}</h1>
        <p className="hero__subtitle">{t('catalog.heroSubtitle')}</p>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      {games === null ? (
        <Loader label={t('catalog.loading')} />
      ) : games.length === 0 ? (
        <div className="empty-state">
          <p>{t('catalog.empty')}</p>
        </div>
      ) : (
        <div className="game-grid">
          {games.map((game) => (
            <GameCard key={game._id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
