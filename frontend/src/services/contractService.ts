import type { SmartContract } from '../models/contract';
import { getToken } from './authService';

const API_BASE_URL = '/api';

/**
 * Получить смарт-контракт по ID гранта
 */
export const fetchContractByGrantId = async (
  grantId: number,
  signal?: AbortSignal
): Promise<SmartContract | null> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/grant/${grantId}/contract`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    signal,
  });

  if (response.status === 404) {
    return null; // Контракт не найден
  }

  if (!response.ok) {
    throw new Error('Failed to fetch contract');
  }

  return response.json();
};

/**
 * Получить смарт-контракт по ID группы покупок
 * (через группу можно найти грант, а затем контракт)
 */
export const fetchContractByGroupId = async (
  purchaseGroupId: number,
  signal?: AbortSignal
): Promise<SmartContract | null> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/purchase-group/${purchaseGroupId}/contract`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    signal,
  });

  if (response.status === 404) {
    return null; // Контракт не найден
  }

  if (!response.ok) {
    throw new Error('Failed to fetch contract');
  }

  return response.json();
};

/**
 * Мок-данные для демонстрации (используется, если бэкенд ещё не готов)
 */
export const getMockContract = (grantId: number): SmartContract => {
  const mockContracts: Record<number, SmartContract> = {
    1: {
      id: 1,
      grant_id: 1,
      contract_number: 'SC-2024-001',
      status: 'active',
      spending_rules: [
        {
          category_id: 1,
          category_name: 'Электроника',
          product_types: ['ноутбуки', 'мониторы', 'клавиатуры', 'мыши'],
          allowed_models: ['Honor MagicBook 16', 'Lenovo ThinkPad E14'],
          max_amount: 450000,
        },
        {
          category_id: 2,
          category_name: 'Садовый инвентарь',
          product_types: ['газонокосилки', 'садовые ножницы'],
        },
      ],
      total_budget: 100000,
      remaining_budget: 75000,
      currency: 'RUB',
      created_at: '2024-01-15T10:00:00Z',
      valid_from: '2024-01-15',
      valid_until: '2024-12-31',
    },
    2: {
      id: 2,
      grant_id: 2,
      contract_number: 'SC-2024-002',
      status: 'active',
      spending_rules: [
        {
          category_id: 1,
          category_name: 'Электроника',
          product_types: ['ноутбуки', 'мониторы'],
        },
      ],
      total_budget: 50000,
      remaining_budget: 50000,
      currency: 'RUB',
      created_at: '2024-02-20T10:00:00Z',
      valid_from: '2024-02-20',
      valid_until: '2024-12-31',
    },
  };

  return mockContracts[grantId] || {
    id: grantId,
    grant_id: grantId,
    status: 'active',
    spending_rules: [],
    total_budget: 0,
    remaining_budget: 0,
    currency: 'RUB',
    created_at: new Date().toISOString(),
  };
};
