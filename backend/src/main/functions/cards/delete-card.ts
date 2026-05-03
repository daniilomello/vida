import { handler } from "../../../application/controllers/cards/delete-card";
import { createHttpHandler } from "../../middy/factory";

export const deleteCard = createHttpHandler(handler);
