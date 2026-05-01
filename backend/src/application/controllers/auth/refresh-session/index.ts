import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { ONE_HOUR, parseCookies, setCookie } from "../../../../main/utils/cookies";
import { cognitoClient } from "../../../clients/cognito";
import { createError, HttpError } from "../../../errors";

export const handler: APIGatewayProxyHandler = async (event) => {
  const cookieHeader = event.headers?.Cookie ?? event.headers?.cookie ?? "";
  const { refreshToken } = parseCookies(cookieHeader);

  if (!refreshToken) throw createError(401, "No refresh token");

  try {
    const result = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: process.env.COGNITO_CLIENT_ID ?? "",
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      }),
    );

    const { IdToken, AccessToken } = result.AuthenticationResult ?? {};
    if (!IdToken || !AccessToken) throw createError(401, "Token refresh failed");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      multiValueHeaders: {
        "Set-Cookie": [
          setCookie("idToken", IdToken, ONE_HOUR),
          setCookie("accessToken", AccessToken, ONE_HOUR),
        ],
      },
      body: JSON.stringify({ message: "Session refreshed" }),
    };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw createError(401, "Invalid or expired refresh token");
  }
};
