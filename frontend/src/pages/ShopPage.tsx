import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { getMyPurchases, getShopRoles, purchaseRole } from '../api/shop';
import type { CardInput } from '../api/shop';
import type { RolePurchase, ShopRole } from '../types';

const ROLE_RANK: Record<string, number> = {
  user: 0,
  developer: 1,
  security: 2,
  admin: 3,
};

const PERK_KEY: Record<string, string> = {
  publish_one_game: 'shop.perkPublishGame',
  developer_badge: 'shop.perkDeveloperBadge',
  moderate_pending_games: 'shop.perkModerate',
  ban_unban_users: 'shop.perkBanUsers',
  security_badge: 'shop.perkSecurityBadge',
};

function formatPrice(cents: number, currency: string): string {
  const dollars = cents / 100;
  if (currency === 'USD') return `$${dollars.toFixed(0)}`;
  return `${dollars.toFixed(2)} ${currency}`;
}

function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function ShopPage() {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const [roles, setRoles] = useState<ShopRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<RolePurchase[]>([]);
  const [activeRole, setActiveRole] = useState<ShopRole | null>(null);
  const [card, setCard] = useState<CardInput>({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingRoles(true);
    getShopRoles()
      .then((r) => {
        if (!cancelled) setRoles(r);
      })
      .catch((err: Error) => {
        if (!cancelled) setErrorRoles(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingRoles(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    getMyPurchases()
      .then((p) => {
        if (!cancelled) setPurchases(p);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [user, success]);

  const userRank = user ? (ROLE_RANK[user.role] ?? 0) : 0;

  const roleNameKey = useMemo(
    () =>
      ({
        developer: 'shop.roleDeveloperName',
        security: 'shop.roleSecurityName',
      }) as const,
    []
  );
  const roleDescKey = useMemo(
    () =>
      ({
        developer: 'shop.roleDeveloperDesc',
        security: 'shop.roleSecurityDesc',
      }) as const,
    []
  );

  function startPurchase(role: ShopRole) {
    setActiveRole(role);
    setCard({ number: '', name: '', expiry: '', cvc: '' });
    setSubmitError(null);
    setSuccess(null);
  }

  function closeCheckout() {
    setActiveRole(null);
    setSubmitError(null);
  }

  async function submitPurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!activeRole) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await purchaseRole(activeRole.id, card);
      await refresh();
      setSuccess(t('shop.success'));
      setActiveRole(null);
    } catch (err) {
      const e = err as Error;
      setSubmitError(
        e.message && e.message.startsWith('CARD_')
          ? t('shop.invalidCard')
          : e.message || t('shop.failed')
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <section className="shop">
        <header className="shop__header">
          <h1>{t('shop.title')}</h1>
          <p className="shop__subtitle">{t('shop.subtitle')}</p>
        </header>

        {success && <div className="success-banner">{success}</div>}

        {loadingRoles ? (
          <p>{t('common.loading')}</p>
        ) : errorRoles ? (
          <div className="error-banner">{errorRoles}</div>
        ) : (
          <div className="shop__grid">
            {roles.map((role) => {
              const owned = userRank >= (ROLE_RANK[role.id] ?? 0);
              return (
                <article key={role.id} className={`shop-card shop-card--${role.id}`}>
                  <div className="shop-card__body">
                    <span className={`role-pill role-pill--${role.id}`}>
                      {t(roleNameKey[role.id])}
                    </span>
                    <h2 className="shop-card__title">{t(roleNameKey[role.id])}</h2>
                    <p className="shop-card__desc">{t(roleDescKey[role.id])}</p>
                    <ul className="shop-card__perks">
                      {role.perks.map((perk) => (
                        <li key={perk}>{PERK_KEY[perk] ? t(PERK_KEY[perk] as never) : perk}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="shop-card__footer">
                    <span className="shop-card__price">
                      {formatPrice(role.priceCents, role.currency)}
                    </span>
                    {owned ? (
                      <span className="shop-card__owned">{t('shop.youHaveRole')}</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={() => startPurchase(role)}
                      >
                        {t('shop.buy')}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {user && (
          <section className="shop__history">
            <h2>{t('shop.history')}</h2>
            {purchases.length === 0 ? (
              <p className="empty-state">{t('shop.historyEmpty')}</p>
            ) : (
              <ul className="purchase-list">
                {purchases.map((p) => (
                  <li key={p._id} className="purchase-item">
                    <div className="purchase-item__main">
                      <span className={`role-pill role-pill--${p.role}`}>
                        {p.role === 'developer'
                          ? t('shop.roleDeveloperName')
                          : t('shop.roleSecurityName')}
                      </span>
                      <span className="purchase-item__price">
                        {formatPrice(p.priceCents, p.currency)}
                      </span>
                    </div>
                    <div className="purchase-item__meta">
                      {p.cardLast4 && <span>•••• {p.cardLast4}</span>}
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </section>

      {activeRole && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCheckout();
          }}
        >
          <form className="checkout-modal" onSubmit={submitPurchase}>
            <header className="checkout-modal__header">
              <h2>{t('shop.checkoutTitle')}</h2>
              <div className="checkout-modal__role">
                <span className={`role-pill role-pill--${activeRole.id}`}>
                  {t(roleNameKey[activeRole.id])}
                </span>
                <strong>{formatPrice(activeRole.priceCents, activeRole.currency)}</strong>
              </div>
            </header>

            <p className="checkout-modal__demo">{t('shop.demoNotice')}</p>

            <label className="field">
              <span>{t('shop.cardName')}</span>
              <input
                type="text"
                required
                autoComplete="cc-name"
                value={card.name}
                onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
              />
            </label>

            <label className="field">
              <span>{t('shop.cardNumber')}</span>
              <input
                type="text"
                required
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                value={card.number}
                onChange={(e) =>
                  setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))
                }
              />
            </label>

            <div className="checkout-modal__row">
              <label className="field">
                <span>{t('shop.cardExpiry')}</span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) =>
                    setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))
                  }
                />
              </label>
              <label className="field">
                <span>{t('shop.cardCvc')}</span>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  maxLength={4}
                  value={card.cvc}
                  onChange={(e) =>
                    setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, '') }))
                  }
                />
              </label>
            </div>

            {submitError && <div className="error-banner">{submitError}</div>}

            <div className="checkout-modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={closeCheckout}
                disabled={submitting}
              >
                {t('shop.cancel')}
              </button>
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? t('shop.purchasing') : t('shop.payNow')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
