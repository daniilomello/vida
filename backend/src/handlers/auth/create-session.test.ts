import type { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "./create-session";

function makeEvent(body: unknown): APIGatewayProxyEvent {
  return {
    body: JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: "POST",
    isBase64Encoded: false,
    path: "/api/v1/auth/session",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
    stageVariables: null,
  };
}

const validTokens = {
  accessToken: "access.token.value",
  idToken: "id.token.value",
  refreshToken: "refresh.token.value",
};

describe("createSession", () => {
  it("should set three httpOnly cookies and return 200 on valid input", async () => {
    const result = await handler(makeEvent(validTokens), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ message: "Session created" });

    const cookies = res.multiValueHeaders?.["Set-Cookie"] as string[];
    expect(cookies).toHaveLength(3);

    const idCookie = cookies.find((c) => c.startsWith("idToken="));
    const accessCookie = cookies.find((c) => c.startsWith("accessToken="));
    const refreshCookie = cookies.find((c) => c.startsWith("refreshToken="));

    expect(idCookie).toContain("id.token.value");
    expect(idCookie).toContain("HttpOnly");
    expect(idCookie).toContain("SameSite=Strict");

    expect(accessCookie).toContain("access.token.value");
    expect(refreshCookie).toContain("refresh.token.value");
    expect(refreshCookie).toContain("Max-Age=2592000");
  });

  it("should return 400 when a token is missing", async () => {
    const result = await handler(
      makeEvent({ accessToken: "x", idToken: "y" }),
      {} as never,
      () => {},
    );
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 400 when body is not valid JSON", async () => {
    const event = makeEvent(null);
    event.body = "not-json";

    const result = await handler(event, {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe("INVALID_JSON");
  });

  it("should return 400 when body is empty", async () => {
    const event = makeEvent(null);
    event.body = null;

    const result = await handler(event, {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error.code).toBe("VALIDATION_ERROR");
  });
});
