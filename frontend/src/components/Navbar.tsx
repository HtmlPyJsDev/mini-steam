import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation, LANGUAGES, type Language } from '../i18n/I18nContext';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { RolePill } from './RolePill';

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
          {user ? (
            <NavLink to="/friends" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {t('nav.friends')}
            </NavLink>
          ) : null}
          {user ? (
            <NavLink to="/chat" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {t('nav.messages')}
            </NavLink>
          ) : null}
          {user ? (
            <NavLink to="/developer" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {t('nav.developer')}
            </NavLink>
          ) : null}
          {user ? (
            <NavLink to="/shop" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {t('nav.shop')}
            </NavLink>
          ) : null}
          {user ? (
            <NavLink to="/contests" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {t('nav.contests')}
            </NavLink>
          ) : null}
          {user && (user.role === 'admin' || user.role === 'security') ? (
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
              <Link
                to="/shop"
                className="uzis-pill"
                title={t('nav.uzisBalanceTooltip')}
                aria-label={`${user.uzis ?? 0} uzis`}
              >
                <span className="uzis-pill__icon" aria-hidden="true">⌬</span>
                <span className="uzis-pill__amount">{(user.uzis ?? 0).toLocaleString()}</span>
                <span className="uzis-pill__label">uzis</span>
              </Link>
              <Link to="/profile" className="navbar__user" aria-label={t('nav.profile')}>
                <Avatar src={user.avatarUrl} name={user.displayName} email={user.email} size={28} />
                <span className="navbar__email">{user.displayName || user.email}</span>
                <RolePill role={user.role} />
              </Link>
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
