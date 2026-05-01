import type { APIGatewayProxyHandler } from "aws-lambda";
import { ONE_HOUR, setCookie, THIRTY_DAYS } from "../../lib/cookies";

interface SessionBody {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  let body: Partial<SessionBody>;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: { code: "INVALID_JSON", message: "Request body must be valid JSON" },
      }),
    };
  }

  const { accessToken, idToken, refreshToken } = body;
  if (!accessToken || !idToken || !refreshToken) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: {
          code: "VALIDATION_ERROR",
          message: "accessToken, idToken, and refreshToken are required",
        },
      }),
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    multiValueHeaders: {
      "Set-Cookie": [
        setCookie("idToken", idToken, ONE_HOUR),
        setCookie("accessToken", accessToken, ONE_HOUR),
        setCookie("refreshToken", refreshToken, THIRTY_DAYS),
      ],
    },
    body: JSON.stringify({ message: "Session created" }),
  };
};
