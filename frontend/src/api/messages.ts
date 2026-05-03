import { apiRequest } from './client';
import type { ChatMessage, Conversation, PublicUser } from '../types';

export function listConversations(): Promise<{ conversations: Conversation[] }> {
  return apiRequest<{ conversations: Conversation[] }>('/messages/conversations', { auth: true });
}

export function listMessages(friendId: string): Promise<{ friend: PublicUser; messages: ChatMessage[] }> {
  return apiRequest<{ friend: PublicUser; messages: ChatMessage[] }>(`/messages/${friendId}`, {
    auth: true,
  });
}

export function sendMessage(friendId: string, text: string): Promise<{ message: ChatMessage }> {
  return apiRequest<{ message: ChatMessage }>(`/messages/${friendId}`, {
    method: 'POST',
    body: { text },
    auth: true,
  });
}
