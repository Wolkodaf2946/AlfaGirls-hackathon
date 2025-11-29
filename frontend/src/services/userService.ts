import type { UserSummary } from "../models/user";
import { getToken } from "./authService";

const API_BASE_URL = '/api';

export const fetchAllUsers = async (signal?: AbortSignal): Promise<UserSummary[]> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/user/allUsers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

export const fetchUserById = async (userId: number, signal?: AbortSignal): Promise<UserSummary> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}/user/getUserById?id=${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
};

