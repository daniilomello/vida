import { handler } from "../../../application/controllers/auth/refresh-session";
import { createHttpHandler } from "../../middy/factory";

export const refreshSession = createHttpHandler(handler);
