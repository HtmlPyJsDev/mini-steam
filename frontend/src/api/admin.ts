import { apiRequest } from './client';
import type { Game } from '../types';

export interface AdminGamePayload {
  title: string;
  description: string;
  license: string;
  cover?: File | null;
  screenshots?: File[];
  gameFile?: File | null;
}

function buildFormData(payload: AdminGamePayload, requireFiles: boolean): FormData {
  const fd = new FormData();
  fd.append('title', payload.title);
  fd.append('description', payload.description);
  fd.append('license', payload.license);

  if (payload.cover) {
    fd.append('cover', payload.cover);
  } else if (requireFiles) {
    throw new Error('Cover image is required');
  }

  if (payload.gameFile) {
    fd.append('gameFile', payload.gameFile);
  } else if (requireFiles) {
    throw new Error('Game file is required');
  }

  if (payload.screenshots && payload.screenshots.length > 0) {
    for (const f of payload.screenshots) {
      fd.append('screenshots', f);
    }
  }

  return fd;
}

export function createGame(payload: AdminGamePayload): Promise<{ game: Game }> {
  const fd = buildFormData(payload, true);
  return apiRequest<{ game: Game }>('/admin/games', {
    method: 'POST',
    formData: fd,
    auth: true,
  });
}

export function updateGame(id: string, payload: AdminGamePayload): Promise<{ game: Game }> {
  const fd = buildFormData(payload, false);
  return apiRequest<{ game: Game }>(`/admin/games/${id}`, {
    method: 'PUT',
    formData: fd,
    auth: true,
  });
}

export function deleteGame(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/admin/games/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
