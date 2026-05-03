import { apiRequest, API_URL, getToken } from './client';
import {
  uploadGameFileSmart,
  type ProgressListener,
  type ResolvedFile,
} from './multipartUpload';
import type { Game } from '../types';

export function getDeveloperSlot(): Promise<{ slotUsed: boolean; game: Game | null }> {
  return apiRequest<{ slotUsed: boolean; game: Game | null }>('/developer/me', { auth: true });
}

export function uploadDeveloperGameFile(
  file: File,
  onProgress?: ProgressListener
): Promise<ResolvedFile> {
  return uploadGameFileSmart(file, {
    presignPath: '/developer/uploads/game-file/presign',
    multipartPaths: {
      init: '/developer/uploads/game-file/multipart/init',
      sign: '/developer/uploads/game-file/multipart/sign',
      complete: '/developer/uploads/game-file/multipart/complete',
      abort: '/developer/uploads/game-file/multipart/abort',
    },
    onProgress,
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
