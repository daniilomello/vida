import { handler } from "../../../application/controllers/transactions/create-transaction";
import { createHttpHandler } from "../../middy/factory";

export const createTransaction = createHttpHandler(handler);
