import { useCallback, useEffect, useState } from 'react';
import { fetchCaptcha, type CaptchaChallenge } from '../api/captcha';
import { useTranslation } from '../i18n/I18nContext';

interface CaptchaProps {
  value: string;
  onChange: (value: string) => void;
  onChallengeChange: (challengeId: string) => void;
  disabled?: boolean;
}

export function Captcha({ value, onChange, onChallengeChange, disabled }: CaptchaProps) {
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await fetchCaptcha();
      setChallenge(c);
      onChallengeChange(c.id);
      onChange('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('captcha.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [onChallengeChange, onChange, t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div className="captcha">
      <div className="captcha__row">
        <div
          className="captcha__image"
          aria-label="captcha challenge"
          dangerouslySetInnerHTML={{
            __html: challenge?.svg || '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="60"><rect width="180" height="60" fill="#13243a"/></svg>',
          }}
        />
        <button
          type="button"
          className="btn btn--ghost captcha__refresh"
          onClick={reload}
          disabled={loading || disabled}
          aria-label={t('captcha.refresh')}
          title={t('captcha.refresh')}
        >
          ↻
        </button>
      </div>
      <label className="field captcha__field">
        <span>{t('captcha.label')}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder={t('captcha.placeholder')}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={8}
          disabled={disabled}
          required
        />
      </label>
      {error ? <div className="error-banner">{error}</div> : null}
    </div>
  );
}
