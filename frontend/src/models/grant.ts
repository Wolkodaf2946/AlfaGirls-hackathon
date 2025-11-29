export interface Grant {
  id: number;
  grantor_id: number;
  granter_id: number;
  total_amount: number;
  must: number;
  created_at: string;
}

export interface PurchaseGroup {
  id: number;
  grant_id: number;
  category_id: number;
  name: string;
  created_at: string;
}

export interface GroupItem {
  id: number;
  purchase_group_id: number;
  product_name: string;
  quantity: number;
  status?: 'not_purchased' | 'processing' | 'completed' | 'contract_error';
  receipt_url?: string;
}

export interface QRScanResult {
  user_account: string;
  amount: number;
  merchant_name: string;
  approved: boolean;
}

