import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn() as jest.MockedFunction<(cmd: unknown) => Promise<unknown>>;

jest.mock("../../../clients/cognito", () => ({
  cognitoClient: { send: mockSend },
  cognitoVerifier: {},
}));

// eslint-disable-next-line import/first
import { handler } from ".";

function makeEvent(cookieHeader?: string): APIGatewayProxyEvent {
  return {
    body: null,
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
    multiValueHeaders: {},
    httpMethod: "POST",
    isBase64Encoded: false,
    path: "/api/v1/auth/refresh",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
    stageVariables: null,
  };
}

describe("refreshSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reissue idToken and accessToken cookies on a valid refresh token", async () => {
    mockSend.mockResolvedValue({
      AuthenticationResult: { IdToken: "new.id.token", AccessToken: "new.access.token" },
    });

    const result = await handler(
      makeEvent("refreshToken=valid.refresh.token"),
      {} as never,
      () => {},
    );
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ message: "Session refreshed" });

    const cookies = res.multiValueHeaders?.["Set-Cookie"] as string[];
    expect(cookies).toHaveLength(2);
    expect(cookies.find((c) => c.startsWith("idToken="))).toContain("new.id.token");
    expect(cookies.find((c) => c.startsWith("accessToken="))).toContain("new.access.token");
  });

  it("should throw 401 when no refresh token cookie is present", async () => {
    await expect(handler(makeEvent(), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 401,
    });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("should throw 401 when Cognito rejects the refresh token", async () => {
    mockSend.mockRejectedValue(new Error("NotAuthorizedException"));

    await expect(
      handler(makeEvent("refreshToken=expired.refresh.token"), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should throw 401 when Cognito returns no tokens", async () => {
    mockSend.mockResolvedValue({ AuthenticationResult: {} });

    await expect(
      handler(makeEvent("refreshToken=refresh.token"), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
