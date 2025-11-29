export interface UserSummary {
  id: number;
  full_name: string;
  email: string;
  bank_account_number?: string | number | null;
  bank_card_number?: string | number | null;
  created_at?: string;
}

