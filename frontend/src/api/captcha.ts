import { apiRequest } from './client';

export interface CaptchaChallenge {
  id: string;
  svg: string;
  expiresIn: number;
}

export function fetchCaptcha(): Promise<CaptchaChallenge> {
  return apiRequest<CaptchaChallenge>('/captcha', { method: 'GET' });
}
