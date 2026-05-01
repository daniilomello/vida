import type { APIGatewayProxyHandler } from "aws-lambda";
import { createHttpHandler } from "../middy/factory";

const handler: APIGatewayProxyHandler = async () => ({
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "ok" }),
});

export const health = createHttpHandler(handler);
