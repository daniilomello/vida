import { handler } from "../../../application/controllers/transactions/delete-transaction";
import { createHttpHandler } from "../../middy/factory";

export const deleteTransaction = createHttpHandler(handler);
