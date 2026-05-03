import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-mark">▶</span>
          <span>Uzisoft</span>
        </Link>

        <nav className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Catalog
          </NavLink>
          {user ? (
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Profile
            </NavLink>
          ) : null}
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="navbar__auth">
          {user ? (
            <>
              <span className="navbar__email">{user.email}</span>
              <button type="button" className="btn btn--ghost" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn--primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
