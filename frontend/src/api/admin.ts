import { apiRequest } from './client';
import type { Game, User, UserRole } from '../types';

export interface AdminGamePayload {
  title: string;
  description: string;
  license: string;
  cover?: File | null;
  screenshots?: File[];
  gameFile?: File | null;
}

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export type UploadProgress =
  | { kind: 'idle' }
  | { kind: 'presigning' }
  | { kind: 'uploading'; loaded: number; total: number }
  | { kind: 'finalizing' };

export type ProgressListener = (progress: UploadProgress) => void;

function presignGameFile(file: File): Promise<PresignedUpload> {
  return apiRequest<PresignedUpload>('/admin/uploads/game-file/presign', {
    method: 'POST',
    body: {
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
    },
    auth: true,
  });
}

function putToR2WithProgress(
  url: string,
  file: File,
  onProgress?: ProgressListener
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({ kind: 'uploading', loaded: event.loaded, total: event.total });
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`R2 upload failed: HTTP ${xhr.status} ${xhr.statusText || ''}`.trim()));
      }
    };
    xhr.onerror = () => reject(new Error('R2 upload failed: network error'));
    xhr.onabort = () => reject(new Error('R2 upload aborted'));
    xhr.send(file);
  });
}

interface ResolvedGameFile {
  key: string;
  url: string;
  size: number;
}

async function uploadGameFile(
  file: File,
  onProgress?: ProgressListener
): Promise<ResolvedGameFile> {
  onProgress?.({ kind: 'presigning' });
  const presigned = await presignGameFile(file);
  await putToR2WithProgress(presigned.uploadUrl, file, onProgress);
  return {
    key: presigned.key,
    url: presigned.publicUrl,
    size: file.size,
  };
}

function buildFormData(
  payload: AdminGamePayload,
  resolvedGameFile: ResolvedGameFile | null
): FormData {
  const fd = new FormData();
  fd.append('title', payload.title);
  fd.append('description', payload.description);
  fd.append('license', payload.license);

  if (payload.cover) {
    fd.append('cover', payload.cover);
  }

  if (payload.screenshots && payload.screenshots.length > 0) {
    for (const f of payload.screenshots) {
      fd.append('screenshots', f);
    }
  }

  if (resolvedGameFile) {
    fd.append('gameFileKey', resolvedGameFile.key);
    fd.append('gameFileUrl', resolvedGameFile.url);
    fd.append('gameFileSize', String(resolvedGameFile.size));
  }

  return fd;
}

export async function createGame(
  payload: AdminGamePayload,
  onProgress?: ProgressListener
): Promise<{ game: Game }> {
  if (!payload.cover) throw new Error('Cover image is required');
  if (!payload.gameFile) throw new Error('Game file is required');

  const resolvedGameFile = await uploadGameFile(payload.gameFile, onProgress);

  onProgress?.({ kind: 'finalizing' });
  const fd = buildFormData(payload, resolvedGameFile);
  return apiRequest<{ game: Game }>('/admin/games', {
    method: 'POST',
    formData: fd,
    auth: true,
  });
}

export async function updateGame(
  id: string,
  payload: AdminGamePayload,
  onProgress?: ProgressListener
): Promise<{ game: Game }> {
  let resolvedGameFile: ResolvedGameFile | null = null;
  if (payload.gameFile) {
    resolvedGameFile = await uploadGameFile(payload.gameFile, onProgress);
  }

  onProgress?.({ kind: 'finalizing' });
  const fd = buildFormData(payload, resolvedGameFile);
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

export function listUsers(q?: string): Promise<{ users: User[] }> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiRequest<{ users: User[] }>(`/admin/users${qs}`, { auth: true });
}

export function setUserRole(id: string, role: UserRole): Promise<{ user: User }> {
  return apiRequest<{ user: User }>(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: { role },
    auth: true,
  });
}

export function banUser(id: string, reason: string): Promise<{ user: User }> {
  return apiRequest<{ user: User }>(`/admin/users/${id}/ban`, {
    method: 'POST',
    body: { reason },
    auth: true,
  });
}

export function unbanUser(id: string): Promise<{ user: User }> {
  return apiRequest<{ user: User }>(`/admin/users/${id}/unban`, {
    method: 'POST',
    auth: true,
  });
}

export function listPendingGames(): Promise<{ games: Game[] }> {
  return apiRequest<{ games: Game[] }>('/admin/games/pending', { auth: true });
}

export function setGameStatus(id: string, status: 'approved' | 'rejected' | 'pending'): Promise<{ game: Game }> {
  return apiRequest<{ game: Game }>(`/admin/games/${id}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}
