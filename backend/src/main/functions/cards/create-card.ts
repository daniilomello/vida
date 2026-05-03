import { handler } from "../../../application/controllers/cards/create-card";
import { createHttpHandler } from "../../middy/factory";

export const createCard = createHttpHandler(handler);
