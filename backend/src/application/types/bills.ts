export interface Bill {
  id: string;
  type: "BILL_DEFINITION";
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  paidVia: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const VALID_CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "UTILITIES",
  "ENTERTAINMENT",
  "HEALTH",
  "HOUSING",
  "OTHER",
] as const;
