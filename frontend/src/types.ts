export type UserRole = 'user' | 'developer' | 'admin';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  banned?: boolean;
  bannedReason?: string;
  developerGameId?: string | null;
  downloads?: Array<Game | string>;
  createdAt?: string;
}

export interface PublicUser {
  _id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string;
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
  status?: 'approved' | 'pending' | 'rejected';
  uploaderId?: PublicUser | string | null;
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

export interface ChatMessage {
  _id: string;
  from: string;
  to: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  friend: PublicUser;
  lastMessage: ChatMessage | null;
  unread: number;
}

export interface Relation {
  isMe: boolean;
  isFriend: boolean;
  requestIncoming: boolean;
  requestOutgoing: boolean;
}

export interface PublicProfile {
  _id: string;
  email: string;
  role: UserRole;
  displayName: string;
  bio: string;
  avatarUrl: string;
  banned: boolean;
  createdAt?: string;
  friendsCount: number;
  developerGame: { _id: string; title: string; coverUrl: string; license: string; status: string } | null;
}

export interface FriendsPayload {
  friends: PublicUser[];
  requestsIncoming: PublicUser[];
  requestsOutgoing: PublicUser[];
}
