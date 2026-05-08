import { handler } from "../../../application/controllers/bills/update-bill";
import { createHttpHandler } from "../../middy/factory";

export const updateBill = createHttpHandler(handler);
