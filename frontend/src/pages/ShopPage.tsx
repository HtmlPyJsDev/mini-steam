import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import {
  getMyPurchases,
  getShopCatalog,
  requestRole,
  type ShopCatalog,
} from '../api/shop';
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

const TG_ICON = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3L19.7 4.62c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
  </svg>
);

interface CheckoutModalProps {
  role: ShopRole;
  contact: ShopCatalog['contact'];
  onClose: () => void;
  onRequested: (p: RolePurchase) => void;
}

function CheckoutModal({ role, contact, onClose, onRequested }: CheckoutModalProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = formatPrice(role.priceCents, role.currency);

  const roleNameKey =
    role.id === 'developer' ? 'shop.roleDeveloperName' : 'shop.roleSecurityName';

  async function handleNotify() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await requestRole(role.id);
      onRequested(res.purchase);
    } catch (err) {
      const e = err as Error;
      if (e.message === 'REQUEST_ALREADY_PENDING') {
        setError(t('shop.requestAlreadyPending'));
      } else if (e.message === 'ROLE_ALREADY_OWNED') {
        setError(t('shop.youHaveRole'));
      } else {
        setError(e.message || t('common.error'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="checkout-modal checkout-modal--tg">
        <button
          type="button"
          className="checkout-modal__close"
          aria-label={t('shop.cancel')}
          onClick={onClose}
        >
          ✕
        </button>

        <header className="checkout-modal__header">
          <span className={`role-pill role-pill--${role.id}`}>
            {t(roleNameKey)}
          </span>
          <h2>{t('shop.tgTitle')}</h2>
          <p className="checkout-modal__price-line">
            <span>{t('shop.priceLabel')}</span>
            <strong>{price}</strong>
          </p>
        </header>

        <ol className="tg-steps">
          <li>
            <span className="tg-steps__num">1</span>
            <div>
              <strong>{t('shop.tgStep1Title')}</strong>
              <p>{t('shop.tgStep1Desc').replace('{handle}', `@${contact.handle}`)}</p>
            </div>
          </li>
          <li>
            <span className="tg-steps__num">2</span>
            <div>
              <strong>
                {t('shop.tgStep2Title').replace('{price}', price)}
              </strong>
              <p>{t('shop.tgStep2Desc')}</p>
            </div>
          </li>
          <li>
            <span className="tg-steps__num">3</span>
            <div>
              <strong>{t('shop.tgStep3Title')}</strong>
              <p>{t('shop.tgStep3Desc')}</p>
            </div>
          </li>
        </ol>

        {error && <div className="error-banner">{error}</div>}

        <div className="checkout-modal__actions checkout-modal__actions--stack">
          <a
            href={contact.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary tg-button"
          >
            {TG_ICON}
            <span>{t('shop.openTelegram').replace('{handle}', `@${contact.handle}`)}</span>
          </a>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={submitting}
            onClick={handleNotify}
          >
            {submitting ? t('shop.notifying') : t('shop.notifyAdmin')}
          </button>
        </div>
        <p className="checkout-modal__hint">{t('shop.notifyHint')}</p>
      </div>
    </div>
  );
}

export function ShopPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<ShopCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<RolePurchase[]>([]);
  const [activeRole, setActiveRole] = useState<ShopRole | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getShopCatalog()
      .then((c) => {
        if (!cancelled) setCatalog(c);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
  const pendingRoles = useMemo(
    () => new Set(purchases.filter((p) => p.status === 'requested').map((p) => p.role)),
    [purchases]
  );

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

  function statusBadge(status: RolePurchase['status']) {
    if (status === 'granted')
      return <span className="badge badge--success">{t('shop.statusGranted')}</span>;
    if (status === 'rejected')
      return <span className="badge badge--danger">{t('shop.statusRejected')}</span>;
    return <span className="badge">{t('shop.statusRequested')}</span>;
  }

  return (
    <div className="container">
      <section className="shop">
        <header className="shop-hero">
          <div className="shop-hero__body">
            <span className="shop-hero__eyebrow">{t('shop.eyebrow')}</span>
            <h1 className="shop-hero__title">{t('shop.title')}</h1>
            <p className="shop-hero__subtitle">{t('shop.subtitle')}</p>
            {catalog && (
              <a
                className="shop-hero__contact"
                href={catalog.contact.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {TG_ICON}
                <span>@{catalog.contact.handle}</span>
              </a>
            )}
          </div>
          <div className="shop-hero__glow" aria-hidden="true" />
        </header>

        {success && <div className="success-banner">{success}</div>}

        {loading ? (
          <p>{t('common.loading')}</p>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : catalog ? (
          <div className="shop__grid">
            {catalog.roles.map((role) => {
              const owned = userRank >= (ROLE_RANK[role.id] ?? 0);
              const pending = pendingRoles.has(role.id);
              return (
                <article key={role.id} className={`shop-card shop-card--${role.id}`}>
                  <div className="shop-card__top">
                    <span className={`role-pill role-pill--${role.id}`}>
                      {t(roleNameKey[role.id])}
                    </span>
                    <span className="shop-card__price">
                      {formatPrice(role.priceCents, role.currency)}
                    </span>
                  </div>
                  <h2 className="shop-card__title">{t(roleNameKey[role.id])}</h2>
                  <p className="shop-card__desc">{t(roleDescKey[role.id])}</p>
                  <ul className="shop-card__perks">
                    {role.perks.map((perk) => (
                      <li key={perk}>
                        {PERK_KEY[perk] ? t(PERK_KEY[perk] as never) : perk}
                      </li>
                    ))}
                  </ul>
                  <div className="shop-card__footer">
                    {owned ? (
                      <span className="shop-card__owned">
                        {t('shop.youHaveRole')}
                      </span>
                    ) : pending ? (
                      <span className="shop-card__owned">
                        {t('shop.statusRequested')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--primary shop-card__buy"
                        onClick={() => {
                          setActiveRole(role);
                          setSuccess(null);
                        }}
                        disabled={!user}
                      >
                        {t('shop.buy')} · {formatPrice(role.priceCents, role.currency)}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

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
                      {statusBadge(p.status)}
                    </div>
                    <div className="purchase-item__meta">
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </section>

      {activeRole && catalog && (
        <CheckoutModal
          role={activeRole}
          contact={catalog.contact}
          onClose={() => setActiveRole(null)}
          onRequested={(p) => {
            setActiveRole(null);
            setPurchases((arr) => [p, ...arr]);
            setSuccess(t('shop.requestSent'));
          }}
        />
      )}
    </div>
  );
}
