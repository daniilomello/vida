import { handler } from "../../../application/controllers/transactions/mark-bill-paid";
import { createHttpHandler } from "../../middy/factory";

export const markBillPaid = createHttpHandler(handler);
