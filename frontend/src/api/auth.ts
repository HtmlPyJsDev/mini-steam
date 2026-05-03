import { apiRequest } from './client';
import type { AuthResponse, User } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  captchaId: string;
  captchaAnswer: string;
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/register', {
    method: 'POST',
    body: payload,
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
