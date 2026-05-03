import { apiRequest } from './client';
import type { DownloadResponse, Game } from '../types';

export function listGames(): Promise<{ games: Game[] }> {
  return apiRequest<{ games: Game[] }>('/games');
}

export function getGame(id: string): Promise<{ game: Game }> {
  return apiRequest<{ game: Game }>(`/games/${id}`);
}

export function requestDownload(id: string): Promise<DownloadResponse> {
  return apiRequest<DownloadResponse>(`/download/${id}`, { auth: true });
}
