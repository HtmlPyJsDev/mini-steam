import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import { Captcha } from '../components/Captcha';

export function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t('auth.passwordsMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (!captchaId || !captchaAnswer.trim()) {
      setError(t('captcha.required'));
      return;
    }

    setLoading(true);
    try {
      await register({ email, password, captchaId, captchaAnswer: captchaAnswer.trim() });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registrationFailed'));
      setCaptchaNonce((n) => n + 1);
      setCaptchaAnswer('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{t('auth.registerTitle')}</h1>
        <p className="auth-card__subtitle">{t('auth.registerSubtitle')}</p>

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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <label className="field">
          <span>{t('auth.confirmPassword')}</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <Captcha
          key={captchaNonce}
          value={captchaAnswer}
          onChange={setCaptchaAnswer}
          onChallengeChange={setCaptchaId}
          disabled={loading}
        />

        {error ? <div className="error-banner">{error}</div> : null}

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
        </button>

        <p className="auth-card__alt">
          {t('auth.haveAccount')} <Link to="/login">{t('nav.signIn')}</Link>
        </p>
      </form>
    </div>
  );
}
