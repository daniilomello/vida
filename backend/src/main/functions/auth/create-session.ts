import { handler } from "../../../application/controllers/auth/create-session";
import { createHttpHandler } from "../../middy/factory";

export const createSession = createHttpHandler(handler);
