import { apiRequest } from './client';
import type {
  PublicUser,
  GlobalChatMessage,
  GroupChat,
  GroupChatMessage,
  DevUpdate,
} from '../types';

// Presence
export function heartbeat(): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>('/social/presence/heartbeat', {
    method: 'POST',
    auth: true,
  });
}

export function listOnline(): Promise<{ users: PublicUser[]; onlineCount: number }> {
  return apiRequest<{ users: PublicUser[]; onlineCount: number }>('/social/presence/online', {
    auth: true,
  });
}

// Global chat
export function listGlobalMessages(): Promise<{ messages: GlobalChatMessage[] }> {
  return apiRequest<{ messages: GlobalChatMessage[] }>('/social/global-chat', { auth: true });
}

export function sendGlobalMessage(text: string): Promise<{ message: GlobalChatMessage }> {
  return apiRequest<{ message: GlobalChatMessage }>('/social/global-chat', {
    method: 'POST',
    body: { text },
    auth: true,
  });
}

// Groups
export function listGroups(): Promise<{ groups: GroupChat[] }> {
  return apiRequest<{ groups: GroupChat[] }>('/social/groups', { auth: true });
}

export function createGroup(name: string, memberIds: string[]): Promise<{ group: GroupChat }> {
  return apiRequest<{ group: GroupChat }>('/social/groups', {
    method: 'POST',
    body: { name, memberIds },
    auth: true,
  });
}

export function addGroupMembers(
  groupId: string,
  memberIds: string[]
): Promise<{ group: GroupChat }> {
  return apiRequest<{ group: GroupChat }>(`/social/groups/${groupId}/members`, {
    method: 'POST',
    body: { memberIds },
    auth: true,
  });
}

export function leaveGroup(groupId: string): Promise<{ left?: boolean; deleted?: boolean }> {
  return apiRequest<{ left?: boolean; deleted?: boolean }>(`/social/groups/${groupId}/leave`, {
    method: 'DELETE',
    auth: true,
  });
}

export function listGroupMessages(groupId: string): Promise<{ messages: GroupChatMessage[] }> {
  return apiRequest<{ messages: GroupChatMessage[] }>(`/social/groups/${groupId}/messages`, {
    auth: true,
  });
}

export function sendGroupMessage(
  groupId: string,
  text: string
): Promise<{ message: GroupChatMessage }> {
  return apiRequest<{ message: GroupChatMessage }>(`/social/groups/${groupId}/messages`, {
    method: 'POST',
    body: { text },
    auth: true,
  });
}

// Subscriptions
export function subscribe(userId: string): Promise<{ subscribed: boolean; subscriberCount: number }> {
  return apiRequest<{ subscribed: boolean; subscriberCount: number }>(
    `/social/subscriptions/${userId}`,
    { method: 'POST', auth: true }
  );
}

export function unsubscribe(userId: string): Promise<{ subscribed: boolean; subscriberCount: number }> {
  return apiRequest<{ subscribed: boolean; subscriberCount: number }>(
    `/social/subscriptions/${userId}`,
    { method: 'DELETE', auth: true }
  );
}

export function listSubscribers(userId: string): Promise<{ subscribers: PublicUser[]; count: number }> {
  return apiRequest<{ subscribers: PublicUser[]; count: number }>(
    `/social/users/${userId}/subscribers`
  );
}

// Updates
export function listUserUpdates(userId: string): Promise<{ updates: DevUpdate[] }> {
  return apiRequest<{ updates: DevUpdate[] }>(`/social/users/${userId}/updates`);
}

export function listGameUpdates(gameId: string): Promise<{ updates: DevUpdate[] }> {
  return apiRequest<{ updates: DevUpdate[] }>(`/social/games/${gameId}/updates`);
}

export function listFeedUpdates(): Promise<{ updates: DevUpdate[] }> {
  return apiRequest<{ updates: DevUpdate[] }>('/social/feed/updates', { auth: true });
}

export function postUpdate(formData: FormData): Promise<{ update: DevUpdate }> {
  return apiRequest<{ update: DevUpdate }>('/social/updates', {
    method: 'POST',
    formData,
    auth: true,
  });
}

export function deleteUpdate(id: string): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(`/social/updates/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
