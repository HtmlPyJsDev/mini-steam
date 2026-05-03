import { apiRequest } from './client';
import type {
  RolePurchase,
  RoleRequest,
  ShopContact,
  ShopRole,
} from '../types';

export interface ShopCatalog {
  roles: ShopRole[];
  contact: ShopContact;
}

export async function getShopCatalog(): Promise<ShopCatalog> {
  return apiRequest<ShopCatalog>('/shop/roles');
}

export async function requestRole(
  role: 'developer' | 'security',
  note?: string
): Promise<{ purchase: RolePurchase }> {
  return apiRequest<{ purchase: RolePurchase }>('/shop/request', {
    method: 'POST',
    auth: true,
    body: { role, note },
  });
}

export async function getMyPurchases(): Promise<RolePurchase[]> {
  const data = await apiRequest<{ purchases: RolePurchase[] }>('/shop/purchases', {
    auth: true,
  });
  return data.purchases;
}

export async function listRoleRequests(
  status: 'requested' | 'granted' | 'rejected' | 'all' = 'requested'
): Promise<RoleRequest[]> {
  const data = await apiRequest<{ requests: RoleRequest[] }>(
    `/admin/role-requests?status=${encodeURIComponent(status)}`,
    { auth: true }
  );
  return data.requests;
}

export async function grantRoleRequest(id: string): Promise<RoleRequest> {
  const data = await apiRequest<{ request: RoleRequest }>(
    `/admin/role-requests/${id}/grant`,
    { method: 'POST', auth: true }
  );
  return data.request;
}

export async function rejectRoleRequest(id: string): Promise<RoleRequest> {
  const data = await apiRequest<{ request: RoleRequest }>(
    `/admin/role-requests/${id}/reject`,
    { method: 'POST', auth: true }
  );
  return data.request;
}
