import type { APIGatewayProxyHandler } from "aws-lambda";
import { ONE_HOUR, setCookie, THIRTY_DAYS } from "../../../../main/utils/cookies";
import { createError } from "../../../errors";
import type { SessionBody } from "../../../types/auth";

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = event.body as unknown as Partial<SessionBody>;
  const { accessToken, idToken, refreshToken } = body ?? {};

  if (!accessToken || !idToken || !refreshToken) {
    throw createError(400, "accessToken, idToken, and refreshToken are required");
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
