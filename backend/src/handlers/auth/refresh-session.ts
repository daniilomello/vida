import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { ONE_HOUR, parseCookies, setCookie } from "../../lib/cookies";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

export const handler: APIGatewayProxyHandler = async (event) => {
  const cookieHeader = event.headers?.Cookie ?? event.headers?.cookie ?? "";
  const { refreshToken } = parseCookies(cookieHeader);

  if (!refreshToken) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: { code: "UNAUTHORIZED", message: "No refresh token" } }),
    };
  }

  try {
    const result = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: process.env.COGNITO_CLIENT_ID ?? "",
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      }),
    );

    const { IdToken, AccessToken } = result.AuthenticationResult ?? {};
    if (!IdToken || !AccessToken) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Token refresh failed" } }),
      };
    }

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
  } catch {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: { code: "UNAUTHORIZED", message: "Invalid or expired refresh token" },
      }),
    };
  }
};
