import { handler } from "../../../application/controllers/cards/get-cards";
import { createHttpHandler } from "../../middy/factory";

export const getCards = createHttpHandler(handler);
