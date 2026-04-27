import type { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = () =>
  Promise.resolve({
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "ok" }),
  });
