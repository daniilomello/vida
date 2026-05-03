import { handler } from "../../../application/controllers/cards/update-card";
import { createHttpHandler } from "../../middy/factory";

export const updateCard = createHttpHandler(handler);
