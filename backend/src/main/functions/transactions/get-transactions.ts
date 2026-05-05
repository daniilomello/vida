import { handler } from "../../../application/controllers/transactions/get-transactions";
import { createHttpHandler } from "../../middy/factory";

export const getTransactions = createHttpHandler(handler);
