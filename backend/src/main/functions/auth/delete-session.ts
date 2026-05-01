import { handler } from "../../../application/controllers/auth/delete-session";
import { createHttpHandler } from "../../middy/factory";

export const deleteSession = createHttpHandler(handler);
