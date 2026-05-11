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

export interface BuyGameResponse {
  ok: true;
  uzis: number;
  alreadyOwned?: boolean;
  free?: boolean;
  gameId?: string;
}

export function buyGame(id: string): Promise<BuyGameResponse> {
  return apiRequest<BuyGameResponse>(`/games/${id}/buy`, {
    method: 'POST',
    auth: true,
  });
}
