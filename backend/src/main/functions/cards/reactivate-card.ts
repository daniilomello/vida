import { handler } from "../../../application/controllers/cards/reactivate-card";
import { createHttpHandler } from "../../middy/factory";

export const reactivateCard = createHttpHandler(handler);
