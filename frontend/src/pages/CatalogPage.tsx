import { useEffect, useState } from 'react';
import { listGames } from '../api/games';
import type { Game } from '../types';
import { GameCard } from '../components/GameCard';
import { Loader } from '../components/Loader';

export function CatalogPage() {
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
          setError(err instanceof Error ? err.message : 'Failed to load games');
          setGames([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container">
      <section className="hero">
        <h1 className="hero__title">Free & Open-Source Games</h1>
        <p className="hero__subtitle">
          Curated catalog of games with licenses that permit free redistribution. Browse, sign in,
          and download — no hidden fees, no piracy.
        </p>
      </section>

      {error ? <div className="error-banner">{error}</div> : null}

      {games === null ? (
        <Loader label="Loading catalog…" />
      ) : games.length === 0 ? (
        <div className="empty-state">
          <p>No games yet. Check back soon — or sign in as admin to add the first one.</p>
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
