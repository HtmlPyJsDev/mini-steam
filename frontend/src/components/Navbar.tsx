import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation, LANGUAGES, type Language } from '../i18n/I18nContext';
import { Logo } from './Logo';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Uzisoft home">
          <Logo size={30} />
        </Link>

        <nav className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
            {t('nav.catalog')}
          </NavLink>
          {user ? (
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {t('nav.profile')}
            </NavLink>
          ) : null}
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {t('nav.admin')}
            </NavLink>
          ) : null}
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            {t('nav.settings')}
          </NavLink>
        </nav>

        <div className="navbar__auth">
          <select
            className="lang-select"
            aria-label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.code.toUpperCase()} · {l.nativeLabel}
              </option>
            ))}
          </select>
          {user ? (
            <>
              <span className="navbar__email">{user.email}</span>
              <button type="button" className="btn btn--ghost" onClick={handleLogout}>
                {t('nav.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                {t('nav.signIn')}
              </Link>
              <Link to="/register" className="btn btn--primary">
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
