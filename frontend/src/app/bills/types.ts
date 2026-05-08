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

export type BillCategory =
  | "FOOD"
  | "TRANSPORT"
  | "UTILITIES"
  | "ENTERTAINMENT"
  | "HEALTH"
  | "HOUSING"
  | "OTHER";

export interface CreateBillInput {
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  paidVia: string;
}

export type UpdateBillInput = Partial<CreateBillInput>;
