import { apiRequest } from './client';
import type { UzisBalance, UzisLedgerEntry, Contest, User } from '../types';

export function getBalance(): Promise<UzisBalance> {
  return apiRequest<UzisBalance>('/uzis/balance', { auth: true });
}

export function listLedger(limit = 30): Promise<{ entries: UzisLedgerEntry[] }> {
  return apiRequest<{ entries: UzisLedgerEntry[] }>(`/uzis/ledger?limit=${limit}`, { auth: true });
}

export function buyRoleWithUzis(
  role: 'developer' | 'security'
): Promise<{ ok: boolean; role: string; uzis: number; user: User }> {
  return apiRequest<{ ok: boolean; role: string; uzis: number; user: User }>('/uzis/shop/buy', {
    method: 'POST',
    body: { role },
    auth: true,
  });
}

export function adminGrantUzis(
  userId: string,
  amount: number,
  note: string
): Promise<{ ok: boolean; user: { _id: string; email: string; uzis: number } }> {
  return apiRequest<{ ok: boolean; user: { _id: string; email: string; uzis: number } }>(
    '/uzis/admin/grant',
    {
      method: 'POST',
      body: { userId, amount, note },
      auth: true,
    }
  );
}

export function adminListRecentLedger(): Promise<{ entries: UzisLedgerEntry[] }> {
  return apiRequest<{ entries: UzisLedgerEntry[] }>('/uzis/admin/recent', { auth: true });
}

// Contests
export function listContests(
  status: 'active' | 'closed' = 'active'
): Promise<{ contests: Contest[] }> {
  return apiRequest<{ contests: Contest[] }>(`/uzis/contests?status=${status}`, { auth: true });
}

export function getContest(id: string): Promise<{ contest: Contest }> {
  return apiRequest<{ contest: Contest }>(`/uzis/contests/${id}`, { auth: true });
}

export function createContest(payload: {
  title: string;
  description: string;
  prize: number;
  endsAt: string;
}): Promise<{ contest: Contest }> {
  return apiRequest<{ contest: Contest }>('/uzis/contests', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function joinContest(id: string): Promise<{ ok: boolean; contest: Contest }> {
  return apiRequest<{ ok: boolean; contest: Contest }>(`/uzis/contests/${id}/join`, {
    method: 'POST',
    auth: true,
  });
}

export function leaveContest(id: string): Promise<{ ok: boolean; contest: Contest }> {
  return apiRequest<{ ok: boolean; contest: Contest }>(`/uzis/contests/${id}/leave`, {
    method: 'POST',
    auth: true,
  });
}

export function awardContest(
  id: string,
  winnerIds: string[]
): Promise<{ ok: boolean; contest: Contest; share: number }> {
  return apiRequest<{ ok: boolean; contest: Contest; share: number }>(
    `/uzis/contests/${id}/award`,
    {
      method: 'POST',
      body: { winnerIds },
      auth: true,
    }
  );
}

export function deleteContest(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/uzis/contests/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
