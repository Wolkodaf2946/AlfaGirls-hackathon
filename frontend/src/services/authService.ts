const API_BASE_URL = '/api';

export interface SignInRequest {
  full_name: string;
  password: string;
}

export interface SignInResponse {
  access_token: string;
  id: number;
  flag: boolean; // true = admin, false = user
}

export interface SignUpRequest {
  full_name: string;
  email: string;
  password: string;
  bank_account_number: string;
  bank_card_number: string;
}

export interface SignUpResponse {
  id: number;
}

export const signIn = async (data: SignInRequest): Promise<SignInResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-in/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      full_name: data.full_name,
      password: data.password,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to sign in';
    const responseText = await response.text();
    
    try {
      const errorData = JSON.parse(responseText);
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch {
      errorMessage = responseText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/sign-up/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      bank_account_number: data.bank_account_number,
      bank_card_number: data.bank_card_number,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to sign up';
    const responseText = await response.text();
    
    try {
      const errorData = JSON.parse(responseText);
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch {
      errorMessage = responseText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

