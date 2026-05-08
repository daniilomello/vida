import { handler } from "../../../application/controllers/bills/get-bills";
import { createHttpHandler } from "../../middy/factory";

export const getBills = createHttpHandler(handler);
