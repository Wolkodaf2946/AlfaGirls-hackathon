import type { Grant, PurchaseGroup, GroupItem, QRScanResult } from '../models/grant';
import { getToken } from './authService';

const API_BASE_URL = '/api';

export const fetchUserGrants = async (userId: number, signal?: AbortSignal): Promise<Grant[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/user/grants?UserId=${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch grants');
  }

  return response.json();
};

export const fetchGrant = async (userId: number, grantId: number, signal?: AbortSignal): Promise<Grant> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/user/grant?UserId=${userId}&GrantId=${grantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch grant');
  }

  return response.json();
};

export const fetchPurchaseGroups = async (grantId: number, signal?: AbortSignal): Promise<PurchaseGroup[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/grant/${grantId}/purchase-groups`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch purchase groups');
  }

  return response.json();
};

export const fetchGroupItems = async (purchaseGroupId: number, signal?: AbortSignal): Promise<GroupItem[]> => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/purchase-group/${purchaseGroupId}/items`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch group items');
  }

  return response.json();
};

export const scanQRCode = async (): Promise<QRScanResult> => {
  // Мок-данные: случайно выбираем один из двух вариантов
  const mockResults: QRScanResult[] = [
    {
      user_account: '12345678901234567890',
      amount: 15000.50,
      merchant_name: 'Магазин электроники "ТехноМир"',
      approved: true,
    },
    {
      user_account: '98765432109876543210',
      amount: 8500.00,
      merchant_name: 'Садовая техника "Зеленый мир"',
      approved: false,
    },
  ];

  // Имитация задержки API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Случайный выбор результата
  return mockResults[Math.floor(Math.random() * mockResults.length)];
};

export const uploadReceipt = async (
  purchaseGroupId: number,
  file: File,
  signal?: AbortSignal
): Promise<{ success: boolean; receipt_url?: string }> => {
  const token = getToken();
  const formData = new FormData();
  formData.append('receipt', file);
  formData.append('purchase_group_id', purchaseGroupId.toString());

  const response = await fetch(`${API_BASE_URL}/purchase-group/${purchaseGroupId}/receipt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to upload receipt');
  }

  return response.json();
};

