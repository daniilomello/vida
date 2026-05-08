import { handler } from "../../../application/controllers/bills/delete-bill";
import { createHttpHandler } from "../../middy/factory";

export const deleteBill = createHttpHandler(handler);
