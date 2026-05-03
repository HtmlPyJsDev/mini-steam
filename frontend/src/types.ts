export interface User {
  _id: string;
  email: string;
  role: 'user' | 'admin';
  downloads?: Array<Game | string>;
  createdAt?: string;
}

export interface Game {
  _id: string;
  title: string;
  description: string;
  coverUrl: string;
  screenshots: string[];
  fileUrl: string;
  fileKey: string;
  license: string;
  size: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DownloadResponse {
  url: string;
  fileKey: string;
  title: string;
  size: number;
  license: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}
