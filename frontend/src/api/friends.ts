import { apiRequest } from './client';
import type { FriendsPayload } from '../types';

export function listFriends(): Promise<FriendsPayload> {
  return apiRequest<FriendsPayload>('/friends', { auth: true });
}

export function sendFriendRequest(userId: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/friends/request/${userId}`, {
    method: 'POST',
    auth: true,
  });
}

export function acceptFriendRequest(userId: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/friends/accept/${userId}`, {
    method: 'POST',
    auth: true,
  });
}

export function rejectFriendRequest(userId: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/friends/reject/${userId}`, {
    method: 'POST',
    auth: true,
  });
}

export function removeFriend(userId: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/friends/${userId}`, {
    method: 'DELETE',
    auth: true,
  });
}
