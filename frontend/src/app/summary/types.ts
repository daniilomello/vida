export interface CategoryTotal {
  category: string;
  total: number;
}

export interface PaymentMethodTotal {
  paidVia: string;
  total: number;
  nickname?: string;
}

export interface MonthlySummary {
  month: string;
  totalSpent: number;
  byCategory: CategoryTotal[];
  byPaymentMethod: PaymentMethodTotal[];
}
