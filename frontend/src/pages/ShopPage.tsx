import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import {
  getMyPurchases,
  getShopCatalog,
  requestRole,
  type ShopCatalog,
} from '../api/shop';
import { buyRoleWithUzis, getBalance, listLedger } from '../api/uzis';
import type { RolePurchase, ShopRole, UzisBalance, UzisLedgerEntry } from '../types';

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
  const { user, refresh } = useAuth();
  const [catalog, setCatalog] = useState<ShopCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<RolePurchase[]>([]);
  const [activeRole, setActiveRole] = useState<ShopRole | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [balance, setBalance] = useState<UzisBalance | null>(null);
  const [ledger, setLedger] = useState<UzisLedgerEntry[]>([]);
  const [buyingUzis, setBuyingUzis] = useState<string | null>(null);
  const [uzisError, setUzisError] = useState<string | null>(null);

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
    getBalance()
      .then((b) => {
        if (!cancelled) setBalance(b);
      })
      .catch(() => {
        // ignore
      });
    listLedger(20)
      .then(({ entries }) => {
        if (!cancelled) setLedger(entries);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      cancelled = true;
    };
  }, [user, success]);

  async function handleBuyWithUzis(role: 'developer' | 'security') {
    if (!user) return;
    setBuyingUzis(role);
    setUzisError(null);
    try {
      const res = await buyRoleWithUzis(role);
      setSuccess(t('shop.uzisPurchaseSuccess').replace('{role}', role));
      setBalance((b) => (b ? { ...b, uzis: res.uzis } : b));
      await refresh();
      const lg = await listLedger(20);
      setLedger(lg.entries);
    } catch (err) {
      const e = err as Error & { data?: { code?: string; need?: number } };
      const code = e.data?.code;
      if (code === 'INSUFFICIENT_UZIS') {
        setUzisError(t('shop.notEnoughUzis').replace('{need}', String(e.data?.need ?? '')));
      } else if (code === 'ROLE_ALREADY_OWNED') {
        setUzisError(t('shop.youHaveRole'));
      } else {
        setUzisError(e.message || t('common.error'));
      }
    } finally {
      setBuyingUzis(null);
    }
  }

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

        {user && balance && (
          <section className="uzis-overview">
            <div className="uzis-overview__balance">
              <span className="uzis-overview__icon" aria-hidden="true">⌬</span>
              <div>
                <strong>{balance.uzis.toLocaleString()}</strong>
                <span className="uzis-overview__label">uzis</span>
              </div>
            </div>
            <div className="uzis-overview__earn">
              <h3>{t('shop.howToEarn')}</h3>
              <ul>
                <li>
                  ⏱ {t('shop.earnPresence')
                    .replace('{minutes}', String(balance.tickMinutes))
                    .replace('{reward}', String(balance.tickReward))
                    .replace('{cap}', String(balance.dailyCap))}
                </li>
                <li>
                  ⭐ {t('shop.earnReview').replace('{reward}', String(balance.reviewReward))}
                </li>
                <li>🏆 {t('shop.earnContest')}</li>
                <li>👑 {t('shop.earnAdmin')}</li>
              </ul>
            </div>
          </section>
        )}

        {success && <div className="success-banner">{success}</div>}
        {uzisError && <div className="error-banner">{uzisError}</div>}

        {loading ? (
          <p>{t('common.loading')}</p>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : catalog ? (
          <div className="shop__grid">
            {catalog.roles.map((role) => {
              const owned = userRank >= (ROLE_RANK[role.id] ?? 0);
              const pending = pendingRoles.has(role.id);
              const uzisCost =
                balance?.roleCosts?.[role.id] ??
                (role.id === 'developer' ? 500 : role.id === 'security' ? 1000 : 0);
              const canAffordUzis = user && balance ? balance.uzis >= uzisCost : false;
              return (
                <article key={role.id} className={`shop-card shop-card--${role.id}`}>
                  <div className="shop-card__top">
                    <span className={`role-pill role-pill--${role.id}`}>
                      {t(roleNameKey[role.id])}
                    </span>
                    <span className="shop-card__price shop-card__price--uzis">
                      <span aria-hidden="true">⌬</span>
                      {uzisCost.toLocaleString()}
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
                  <div className="shop-card__footer shop-card__footer--stack">
                    {owned ? (
                      <span className="shop-card__owned">
                        {t('shop.youHaveRole')}
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn--primary shop-card__buy"
                          onClick={() => handleBuyWithUzis(role.id)}
                          disabled={!user || buyingUzis !== null || !canAffordUzis}
                          title={
                            !canAffordUzis && balance
                              ? t('shop.notEnoughUzisShort')
                              : ''
                          }
                        >
                          {buyingUzis === role.id
                            ? t('shop.buying')
                            : `${t('shop.buyWithUzis')} · ⌬${uzisCost.toLocaleString()}`}
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost shop-card__buy-tg"
                          onClick={() => {
                            setActiveRole(role);
                            setSuccess(null);
                            setUzisError(null);
                          }}
                          disabled={!user || pending}
                        >
                          {pending
                            ? t('shop.statusRequested')
                            : `${t('shop.buyWithMoney')} · ${formatPrice(role.priceCents, role.currency)}`}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {user && ledger.length > 0 && (
          <section className="uzis-history">
            <h2>{t('shop.uzisHistory')}</h2>
            <ul className="uzis-history__list">
              {ledger.map((entry) => (
                <li key={entry._id} className="uzis-history__item">
                  <span
                    className={`uzis-history__delta ${entry.delta > 0 ? 'is-pos' : 'is-neg'}`}
                  >
                    {entry.delta > 0 ? '+' : ''}
                    {entry.delta.toLocaleString()}
                  </span>
                  <span className="uzis-history__reason">{entry.reason}</span>
                  {entry.note ? (
                    <span className="uzis-history__note">{entry.note}</span>
                  ) : null}
                  <span className="uzis-history__time">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
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
