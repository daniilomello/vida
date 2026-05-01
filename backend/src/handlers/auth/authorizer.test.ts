import type { APIGatewayRequestAuthorizerEvent } from "aws-lambda";

const mockVerify = jest.fn();

jest.mock("aws-jwt-verify", () => ({
  CognitoJwtVerifier: {
    create: jest.fn().mockReturnValue({ verify: mockVerify }),
  },
}));

// Import after mock is set up
// eslint-disable-next-line import/first
import { handler } from "./authorizer";

function makeEvent(cookieHeader?: string): APIGatewayRequestAuthorizerEvent {
  return {
    type: "REQUEST",
    methodArn: "arn:aws:execute-api:us-east-1:123:api/dev/GET/transactions",
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
    multiValueHeaders: {},
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayRequestAuthorizerEvent["requestContext"],
    resource: "",
    path: "",
    httpMethod: "GET",
  };
}

describe("lambdaAuthorizer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return Allow policy when idToken is valid", async () => {
    mockVerify.mockResolvedValue({ sub: "user-123" });

    const result = await handler(makeEvent("idToken=valid.jwt.token"), {} as never, () => {});

    expect(result.principalId).toBe("user-123");
    expect(result.policyDocument.Statement[0].Effect).toBe("Allow");
  });

  it("should return Deny policy when idToken cookie is missing", async () => {
    const result = await handler(makeEvent(), {} as never, () => {});

    expect(result.principalId).toBe("anonymous");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("should return Deny policy when idToken is expired or invalid", async () => {
    mockVerify.mockRejectedValue(new Error("Token expired"));

    const result = await handler(makeEvent("idToken=expired.jwt.token"), {} as never, () => {});

    expect(result.principalId).toBe("anonymous");
    expect(result.policyDocument.Statement[0].Effect).toBe("Deny");
  });

  it("should parse idToken from a multi-cookie header", async () => {
    mockVerify.mockResolvedValue({ sub: "user-456" });

    const result = await handler(
      makeEvent("accessToken=access.token; idToken=id.token; refreshToken=refresh.token"),
      {} as never,
      () => {},
    );

    expect(result.principalId).toBe("user-456");
    expect(result.policyDocument.Statement[0].Effect).toBe("Allow");
  });
});
