import { apiRequest, API_URL, getToken } from './client';
import type { Game } from '../types';

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export function getDeveloperSlot(): Promise<{ slotUsed: boolean; game: Game | null }> {
  return apiRequest<{ slotUsed: boolean; game: Game | null }>('/developer/me', { auth: true });
}

export function presignDeveloperGameFile(
  filename: string,
  contentType: string
): Promise<PresignResponse> {
  return apiRequest<PresignResponse>('/developer/uploads/game-file/presign', {
    method: 'POST',
    body: { filename, contentType },
    auth: true,
  });
}

export interface CreateDeveloperGamePayload {
  title: string;
  description: string;
  license: string;
  cover: File;
  screenshots: File[];
  gameFileKey: string;
  gameFileUrl: string;
  gameFileSize: number;
}

export async function createDeveloperGame(p: CreateDeveloperGamePayload): Promise<{ game: Game }> {
  const fd = new FormData();
  fd.append('title', p.title);
  fd.append('description', p.description);
  fd.append('license', p.license);
  fd.append('gameFileKey', p.gameFileKey);
  fd.append('gameFileUrl', p.gameFileUrl);
  fd.append('gameFileSize', String(p.gameFileSize));
  fd.append('cover', p.cover);
  for (const s of p.screenshots) fd.append('screenshots', s);

  const token = getToken();
  const res = await fetch(`${API_URL}/developer/games`, {
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
        : `Failed to create game: ${res.status}`;
    throw new Error(message);
  }
  return data as { game: Game };
}
