import { Link } from 'react-router-dom';
import { LANGUAGES, useTranslation } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { RolePill } from '../components/RolePill';

export function SettingsPage() {
  const { language, setLanguage, t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="container">
      <section className="settings">
        <header className="settings__header">
          <h1>{t('settings.title')}</h1>
        </header>

        <section className="settings__group">
          <h2>{t('settings.languageSection')}</h2>
          <p className="settings__hint">{t('settings.languageHelp')}</p>
          <div className="lang-grid">
            {LANGUAGES.map((lang) => {
              const active = lang.code === language;
              return (
                <button
                  type="button"
                  key={lang.code}
                  className={`lang-card${active ? ' is-active' : ''}`}
                  onClick={() => setLanguage(lang.code)}
                  aria-pressed={active}
                >
                  <span className="lang-card__code">{lang.code.toUpperCase()}</span>
                  <span className="lang-card__name">{lang.nativeLabel}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="settings__group">
          <h2>{t('settings.account')}</h2>
          {user ? (
            <ul className="settings__account">
              <li>
                <span>{t('settings.signedInAs')}</span>
                <strong>{user.email}</strong>
              </li>
              <li>
                <span>{t('settings.role')}</span>
                <RolePill role={user.role} />
              </li>
            </ul>
          ) : (
            <p className="empty-state">
              {t('settings.signedOut')}{' '}
              <Link to="/login">{t('nav.signIn')}</Link>
            </p>
          )}
        </section>
      </section>
    </div>
  );
}
