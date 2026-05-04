export type UserRole = 'user' | 'developer' | 'security' | 'admin';

export interface ShopRole {
  id: 'developer' | 'security';
  priceCents: number;
  currency: string;
  perks: string[];
}

export interface ShopContact {
  provider: 'telegram';
  handle: string;
  url: string;
}

export type RolePurchaseStatus = 'requested' | 'granted' | 'rejected';

export interface RolePurchase {
  _id: string;
  role: 'developer' | 'security';
  priceCents: number;
  currency: string;
  status: RolePurchaseStatus;
  paymentProvider: string;
  contactHandle?: string;
  note?: string;
  grantedAt?: string | null;
  createdAt: string;
}

export interface RoleRequestUser {
  _id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  banned?: boolean;
}

export interface RoleRequest {
  _id: string;
  role: 'developer' | 'security';
  priceCents: number;
  currency: string;
  status: RolePurchaseStatus;
  contactHandle?: string;
  note?: string;
  createdAt: string;
  grantedAt?: string | null;
  userId: RoleRequestUser | null;
  grantedBy?: { _id: string; email: string; displayName?: string } | null;
}

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
  gpuTier?: number;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  gameId: string;
  rating: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  userId: PublicUser | null;
}

export interface ReviewSummary {
  avg: number;
  count: number;
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
