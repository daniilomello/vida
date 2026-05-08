export const BILL_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "UTILITIES",
  "ENTERTAINMENT",
  "HEALTH",
  "HOUSING",
  "OTHER",
] as const;

export type BillCategory = (typeof BILL_CATEGORIES)[number];

export interface Bill {
  id: string;
  type: "BILL_DEFINITION";
  name: string;
  amount: number;
  dueDay: number;
  category: BillCategory;
  paidVia: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
