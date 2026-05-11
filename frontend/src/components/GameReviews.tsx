import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { Loader } from './Loader';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/I18nContext';
import {
  deleteReview,
  listReviews,
  submitReview,
} from '../api/reviews';
import type { Review, ReviewSummary } from '../types';

interface Props {
  gameId: string;
}

export function GameReviews({ gameId }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [summary, setSummary] = useState<ReviewSummary>({ avg: 0, count: 0 });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const myReview = user ? reviews?.find((r) => r.userId?._id === user._id) : null;
  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState<string>('');

  async function load() {
    try {
      const r = await listReviews(gameId);
      setReviews(r.reviews);
      setSummary(r.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reviews.loadError'));
      setReviews([]);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setText(myReview.text || '');
    }
  }, [myReview?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError(t('reviews.pickRating'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(gameId, rating, text.trim());
      await load();
    } catch (err) {
      const e = err as Error;
      if (e.message === 'RATING_INVALID') setError(t('reviews.pickRating'));
      else setError(e.message || t('reviews.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!window.confirm(t('reviews.confirmDelete'))) return;
    setSubmitting(true);
    try {
      await deleteReview(gameId, reviewId);
      await load();
      if (myReview && myReview._id === reviewId) {
        setRating(0);
        setText('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reviews.submitError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="reviews">
      <header className="reviews__header">
        <h2>{t('reviews.title')}</h2>
        <div className="reviews__summary">
          <StarRating value={summary.avg} size={20} />
          <strong>{summary.avg ? summary.avg.toFixed(1) : '—'}</strong>
          <span className="reviews__count">
            {summary.count} {t('reviews.countSuffix')}
          </span>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}

      {user ? (
        <form className="reviews__form" onSubmit={handleSubmit}>
          <h3>{myReview ? t('reviews.editYours') : t('reviews.leaveOne')}</h3>
          <div className="reviews__form-row">
            <span className="reviews__rating-label">{t('reviews.rating')}</span>
            <StarRating
              value={rating}
              size={26}
              interactive
              onChange={setRating}
              ariaLabel={t('reviews.rating')}
            />
          </div>
          <textarea
            className="reviews__textarea"
            placeholder={t('reviews.textPlaceholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            rows={3}
          />
          <div className="reviews__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting || rating < 1}
            >
              {submitting
                ? t('reviews.sending')
                : myReview
                  ? t('reviews.update')
                  : t('reviews.submit')}
            </button>
            {myReview ? (
              <button
                type="button"
                className="btn btn--ghost"
                disabled={submitting}
                onClick={() => handleDelete(myReview._id)}
              >
                {t('reviews.delete')}
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="reviews__signin">{t('reviews.signInToReview')}</p>
      )}

      {reviews === null ? (
        <Loader label={t('common.loading')} />
      ) : reviews.length === 0 ? (
        <p className="empty-state">{t('reviews.empty')}</p>
      ) : (
        <ul className="reviews__list">
          {reviews.map((rev) => {
            const u = rev.userId;
            const isMine = user && u?._id === user._id;
            const isAdmin = user?.role === 'admin';
            return (
              <li key={rev._id} className="review-item">
                <div className="review-item__head">
                  {u ? (
                    <Link to={`/u/${u._id}`} className="review-item__user">
                      <Avatar
                        src={u.avatarUrl}
                        name={u.displayName}
                        email={u.email}
                        size={36}
                      />
                      <div>
                        <strong>{u.displayName || u.email.split('@')[0]}</strong>
                        <small>{new Date(rev.createdAt).toLocaleDateString()}</small>
                      </div>
                    </Link>
                  ) : (
                    <span className="review-item__user">
                      <em>(deleted)</em>
                    </span>
                  )}
                  <StarRating value={rev.rating} size={16} />
                </div>
                {rev.text ? <p className="review-item__text">{rev.text}</p> : null}
                {(isMine || isAdmin) && (
                  <div className="review-item__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--small"
                      onClick={() => handleDelete(rev._id)}
                      disabled={submitting}
                    >
                      {t('reviews.delete')}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
