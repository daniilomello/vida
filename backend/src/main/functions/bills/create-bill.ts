import { handler } from "../../../application/controllers/bills/create-bill";
import { createHttpHandler } from "../../middy/factory";

export const createBill = createHttpHandler(handler);
