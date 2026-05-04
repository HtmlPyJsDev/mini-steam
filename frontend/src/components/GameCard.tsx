import { Link } from 'react-router-dom';
import type { Game } from '../types';
import { StarRating } from './StarRating';

interface GameCardProps {
  game: Game;
  index?: number;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function GameCard({ game, index = 0 }: GameCardProps) {
  const shortDescription =
    game.description.length > 110 ? `${game.description.slice(0, 110).trim()}…` : game.description;

  const animDelay = `${Math.min(index, 12) * 60}ms`;

  return (
    <Link
      to={`/game/${game._id}`}
      className="game-card"
      style={{ animationDelay: animDelay }}
    >
      <div className="game-card__cover">
        {game.coverUrl ? (
          <img src={game.coverUrl} alt={game.title} loading="lazy" />
        ) : (
          <div className="game-card__cover-placeholder">No cover</div>
        )}
        <div className="game-card__cover-shade" aria-hidden="true" />
        <span className="game-card__license">{game.license}</span>
        <span className="game-card__verified" title="Virus-free">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Zm-1.1 14.4-3.8-3.8 1.4-1.4 2.4 2.4 5-5 1.4 1.4-6.4 6.4Z"
            />
          </svg>
          Safe
        </span>
      </div>
      <div className="game-card__body">
        <h3 className="game-card__title">{game.title}</h3>
        <div className="game-card__row">
          {game.ratingCount && game.ratingCount > 0 ? (
            <div className="game-card__rating">
              <StarRating value={game.ratingAvg ?? 0} size={14} />
              <span>
                {(game.ratingAvg ?? 0).toFixed(1)} · {game.ratingCount}
              </span>
            </div>
          ) : (
            <span className="game-card__pill">New</span>
          )}
          {game.size > 0 ? (
            <span className="game-card__size">{formatBytes(game.size)}</span>
          ) : null}
        </div>
        <p className="game-card__desc">{shortDescription}</p>
        <span className="game-card__cta">
          Play
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13.3 5.3 11.9 6.7l4.3 4.3H4v2h12.2l-4.3 4.3 1.4 1.4 6.7-6.7-6.7-6.7Z"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
