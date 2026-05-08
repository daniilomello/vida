import { handler } from "../../../application/controllers/bills/reactivate-bill";
import { createHttpHandler } from "../../middy/factory";

export const reactivateBill = createHttpHandler(handler);
