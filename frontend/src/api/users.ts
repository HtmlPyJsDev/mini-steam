import { apiRequest } from './client';
import type { PublicUser, PublicProfile, Relation } from '../types';

export function searchUsers(q: string): Promise<{ users: PublicUser[] }> {
  const qs = encodeURIComponent(q);
  return apiRequest<{ users: PublicUser[] }>(`/users/search?q=${qs}`, { auth: true });
}

export function getPublicUser(id: string): Promise<{ user: PublicProfile; relation: Relation }> {
  return apiRequest<{ user: PublicProfile; relation: Relation }>(`/users/${id}`, { auth: true });
}
