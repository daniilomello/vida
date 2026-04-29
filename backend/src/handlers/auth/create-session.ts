import type { APIGatewayProxyHandler } from "aws-lambda";

interface SessionBody {
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

const ONE_HOUR = 60 * 60;
const THIRTY_DAYS = 30 * 24 * 60 * 60;

function cookie(name: string, value: string, maxAge: number): string {
  const parts = [`${name}=${value}`, "HttpOnly", "SameSite=Strict", "Path=/", `Max-Age=${maxAge}`];
  if (process.env.STAGE !== "local") parts.push("Secure");
  return parts.join("; ");
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
        cookie("idToken", idToken, ONE_HOUR),
        cookie("accessToken", accessToken, ONE_HOUR),
        cookie("refreshToken", refreshToken, THIRTY_DAYS),
      ],
    },
    body: JSON.stringify({ message: "Session created" }),
  };
};
