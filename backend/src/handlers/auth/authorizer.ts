import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { parseCookies } from "../../lib/cookies";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID ?? "",
  clientId: process.env.COGNITO_CLIENT_ID ?? "",
  tokenUse: "id",
});

function buildPolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string,
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [{ Action: "execute-api:Invoke", Effect: effect, Resource: resource }],
    },
  };
}

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  const cookieHeader = event.headers?.Cookie ?? event.headers?.cookie ?? "";
  const { idToken } = parseCookies(cookieHeader);

  if (!idToken) return buildPolicy("anonymous", "Deny", event.methodArn);

  try {
    const payload = await verifier.verify(idToken);
    return buildPolicy(payload.sub, "Allow", event.methodArn);
  } catch {
    return buildPolicy("anonymous", "Deny", event.methodArn);
  }
};
