import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getGame, requestDownload } from '../api/games';
import type { Game } from '../types';
import { Loader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeShot, setActiveShot] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);

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
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load game');
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDownload() {
    if (!id) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await requestDownload(id);
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  }

  if (!game) {
    return (
      <div className="container">
        {error ? <div className="error-banner">{error}</div> : <Loader label="Loading game…" />}
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
            <dl className="game-detail__facts">
              <div>
                <dt>License</dt>
                <dd>{game.license}</dd>
              </div>
              <div>
                <dt>File size</dt>
                <dd>{formatBytes(game.size)}</dd>
              </div>
            </dl>

            {user ? (
              <button
                type="button"
                className="btn btn--primary btn--large"
                onClick={handleDownload}
                disabled={downloading}
              >
                {downloading ? 'Preparing link…' : 'Download'}
              </button>
            ) : (
              <div className="auth-cta">
                <p>Sign in to download this game.</p>
                <div className="auth-cta__actions">
                  <Link to="/login" className="btn btn--primary">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn--ghost">
                    Register
                  </Link>
                </div>
              </div>
            )}

            {error ? <div className="error-banner">{error}</div> : null}
          </div>
        </div>

        {game.screenshots.length > 0 ? (
          <section className="game-detail__shots">
            <h2>Screenshots</h2>
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
          <h2>About</h2>
          <p>{game.description}</p>
        </section>
      </article>
    </div>
  );
}
