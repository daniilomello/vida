import { handler } from "../../../application/controllers/summary/get-monthly-summary";
import { createHttpHandler } from "../../middy/factory";

export const getMonthlySummary = createHttpHandler(handler);
