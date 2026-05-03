import { apiRequest } from './client';
import type { AuthResponse, User } from '../types';

export function register(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/register', {
    method: 'POST',
    body: { email, password },
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function fetchMe(): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/me', { auth: true });
}
