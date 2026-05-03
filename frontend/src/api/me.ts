import { apiRequest, API_URL, getToken } from './client';
import type { User } from '../types';

export interface ProfilePatch {
  displayName?: string;
  bio?: string;
}

export function updateMe(patch: ProfilePatch): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/me', {
    method: 'PATCH',
    body: patch,
    auth: true,
  });
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string; user: User }> {
  const fd = new FormData();
  fd.append('avatar', file);
  const token = getToken();
  const res = await fetch(`${API_URL}/me/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? (data as { message: string }).message
        : `Avatar upload failed: ${res.status}`;
    throw new Error(message);
  }
  return data as { avatarUrl: string; user: User };
}

export function deleteAvatar(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/me/avatar', {
    method: 'DELETE',
    auth: true,
  });
}
