export type Language = 'en' | 'hi' | 'bn';

export interface Client {
  id: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  amountReceived: number;
  productCost: number;
  shippingCost: number;
  notes: string;
  date: string;
  type: 'SALE' | 'PAYMENT'; // SALE implies goods sold (calc profit), PAYMENT means just money received/given adjustment
  quantity?: number;
  unitPrice?: number;
}

export interface AppState {
  clients: Client[];
  transactions: Transaction[];
  theme: 'light' | 'dark';
  language: Language;
}

export interface DashboardStats {
  totalReceived: number;
  totalCost: number; // Product + Shipping
  netProfit: number;
  transactionCount: number;
}