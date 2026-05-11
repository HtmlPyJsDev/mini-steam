import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';

export function LoginPage() {
  const { login, setToken } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/';

  const oauthError = searchParams.get('error');
  if (oauthError && !loading) {
    const errorMessages: Record<string, string> = {
      no_code: t('auth.oauthError'),
      no_token: t('auth.oauthError'),
      email_exists: t('auth.emailExists'),
      banned: t('auth.banned'),
    };
    setError(errorMessages[oauthError] || t('auth.oauthError'));
  }

  const githubToken = searchParams.get('token');
  if (githubToken && !loading) {
    setToken(githubToken);
    navigate(from, { replace: true });
  }

  const handleGithubLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/github`;
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{t('auth.signInTitle')}</h1>
        <p className="auth-card__subtitle">{t('auth.signInSubtitle')}</p>

        <label className="field">
          <span>{t('auth.email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span>{t('auth.password')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            minLength={6}
            required
          />
        </label>

        {error ? <div className="error-banner">{error}</div> : null}

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {loading ? t('auth.signingIn') : t('auth.signIn')}
        </button>

        <div className="oauth-divider">
          <span>{t('auth.or')}</span>
        </div>

        <button
          type="button"
          className="btn btn--github btn--block"
          onClick={handleGithubLogin}
        >
          {t('auth.signInWithGithub')}
        </button>

        <p className="auth-card__alt">
          {t('auth.newHere')} <Link to="/register">{t('nav.register')}</Link>
        </p>
      </form>
    </div>
  );
}
