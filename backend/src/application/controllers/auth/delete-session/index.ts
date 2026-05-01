import type { APIGatewayProxyHandler } from "aws-lambda";
import { clearCookie } from "../../../../main/utils/cookies";

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    multiValueHeaders: {
      "Set-Cookie": [
        clearCookie("idToken"),
        clearCookie("accessToken"),
        clearCookie("refreshToken"),
      ],
    },
    body: JSON.stringify({ message: "Session terminated" }),
  };
};
