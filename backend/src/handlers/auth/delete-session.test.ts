import type { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "./delete-session";

function makeEvent(): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "DELETE",
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

describe("deleteSession", () => {
  it("should return 200 with session terminated message", async () => {
    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ message: "Session terminated" });
  });

  it("should clear all three session cookies with Max-Age=0", async () => {
    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const cookies = res.multiValueHeaders?.["Set-Cookie"] as string[];
    expect(cookies).toHaveLength(3);

    for (const name of ["idToken", "accessToken", "refreshToken"]) {
      const cookie = cookies.find((c) => c.startsWith(`${name}=`));
      expect(cookie).toContain("Max-Age=0");
      expect(cookie).toContain("HttpOnly");
    }
  });
});
