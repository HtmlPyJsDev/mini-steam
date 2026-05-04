import { apiRequest } from './client';
import type { Review, ReviewSummary } from '../types';

export function listReviews(
  gameId: string
): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
  return apiRequest<{ reviews: Review[]; summary: ReviewSummary }>(
    `/games/${gameId}/reviews`
  );
}

export function submitReview(
  gameId: string,
  rating: number,
  text: string
): Promise<{ review: Review }> {
  return apiRequest<{ review: Review }>(`/games/${gameId}/reviews`, {
    method: 'POST',
    auth: true,
    body: { rating, text },
  });
}

export function deleteReview(
  gameId: string,
  reviewId: string
): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>(`/games/${gameId}/reviews/${reviewId}`, {
    method: 'DELETE',
    auth: true,
  });
}
