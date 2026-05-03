import { apiRequest } from './client';
import type { ShopRole, RolePurchase, User } from '../types';

export interface CardInput {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}

export async function getShopRoles(): Promise<ShopRole[]> {
  const data = await apiRequest<{ roles: ShopRole[] }>('/shop/roles');
  return data.roles;
}

export interface PurchaseResponse {
  ok: boolean;
  role: User['role'];
  receipt: {
    role: 'developer' | 'security';
    priceCents: number;
    currency: string;
    cardLast4: string;
  };
}

export async function purchaseRole(
  role: 'developer' | 'security',
  card: CardInput
): Promise<PurchaseResponse> {
  return apiRequest<PurchaseResponse>('/shop/purchase', {
    method: 'POST',
    auth: true,
    body: { role, card },
  });
}

export async function getMyPurchases(): Promise<RolePurchase[]> {
  const data = await apiRequest<{ purchases: RolePurchase[] }>('/shop/purchases', {
    auth: true,
  });
  return data.purchases;
}
