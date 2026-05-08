export const CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "UTILITIES",
  "ENTERTAINMENT",
  "HEALTH",
  "HOUSING",
  "OTHER",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Transaction {
  id: string;
  type: "EXPENSE" | "BILL_PAYMENT";
  amount: number;
  description?: string;
  category: Category;
  paidVia: string;
  status: "PAID" | "UNPAID";
  month: string;
  date: string;
  deleted: boolean;
  paidAt?: string;
  billId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  amount: number;
  category: Category;
  paidVia: string;
  description?: string;
  date?: string;
}
