import { Link } from 'react-router-dom';
import type { Game } from '../types';
import { StarRating } from './StarRating';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const shortDescription =
    game.description.length > 140 ? `${game.description.slice(0, 140).trim()}…` : game.description;

  return (
    <Link to={`/game/${game._id}`} className="game-card">
      <div className="game-card__cover">
        {game.coverUrl ? (
          <img src={game.coverUrl} alt={game.title} loading="lazy" />
        ) : (
          <div className="game-card__cover-placeholder">No cover</div>
        )}
        <span className="game-card__license">{game.license}</span>
      </div>
      <div className="game-card__body">
        <h3 className="game-card__title">{game.title}</h3>
        {game.ratingCount && game.ratingCount > 0 ? (
          <div className="game-card__rating">
            <StarRating value={game.ratingAvg ?? 0} size={14} />
            <span>
              {(game.ratingAvg ?? 0).toFixed(1)} · {game.ratingCount}
            </span>
          </div>
        ) : null}
        <p className="game-card__desc">{shortDescription}</p>
      </div>
    </Link>
  );
}
