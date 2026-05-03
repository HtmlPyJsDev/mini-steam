import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import type { Game } from '../types';

export function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const downloads = (user.downloads || []).filter(
    (d): d is Game => typeof d === 'object' && d !== null && '_id' in d
  );

  return (
    <div className="container">
      <section className="profile">
        <header className="profile__header">
          <div>
            <h1>{t('profile.title')}</h1>
            <p className="profile__email">{user.email}</p>
            <span className={`role-pill role-pill--${user.role}`}>
              {user.role === 'admin' ? t('role.admin') : t('role.user')}
            </span>
          </div>
        </header>

        <section className="profile__downloads">
          <h2>{t('profile.history')}</h2>
          {downloads.length === 0 ? (
            <p className="empty-state">
              {t('profile.empty')} <Link to="/">{t('profile.browse')}</Link>.
            </p>
          ) : (
            <ul className="profile__list">
              {downloads.map((game) => (
                <li key={game._id} className="profile__item">
                  <Link to={`/game/${game._id}`} className="profile__item-link">
                    {game.coverUrl ? (
                      <img src={game.coverUrl} alt={game.title} />
                    ) : (
                      <div className="profile__item-placeholder">No cover</div>
                    )}
                    <div>
                      <h3>{game.title}</h3>
                      <p>{game.license}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </div>
  );
}
