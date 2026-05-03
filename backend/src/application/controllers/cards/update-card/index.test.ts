import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

const existingItem = {
  PK: "USER#user-123",
  SK: "CARD#card-uuid-1",
  id: "card-uuid-1",
  nickname: "Nubank",
  active: true,
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z",
};

function makeEvent(
  body: unknown,
  pathParameters: Record<string, string> | null = { id: "card-uuid-1" },
  principalId = "user-123",
): APIGatewayProxyEvent {
  return {
    body: body as unknown as string,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "PUT",
    isBase64Encoded: false,
    path: "/api/v1/cards/card-uuid-1",
    pathParameters,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    requestContext: {
      authorizer: { principalId },
    } as unknown as APIGatewayProxyEvent["requestContext"],
    resource: "",
    stageVariables: null,
  };
}

describe("updateCard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update nickname and return 200 with the updated card", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    const result = await handler(makeEvent({ nickname: "Nubank Black" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.nickname).toBe("Nubank Black");
    expect(body.id).toBe("card-uuid-1");
    expect(body.PK).toBeUndefined();
    expect(body.SK).toBeUndefined();
  });

  it("should trim whitespace from nickname", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    const result = await handler(makeEvent({ nickname: "  Inter  " }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).nickname).toBe("Inter");
  });

  it("should throw 404 when card does not exist", async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined });

    await expect(
      handler(makeEvent({ nickname: "Nubank Black" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should throw 400 when nickname is missing", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem });

    await expect(handler(makeEvent({}), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw 400 when nickname is an empty string", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem });

    await expect(
      handler(makeEvent({ nickname: "   " }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw 401 when principalId is missing", async () => {
    await expect(
      handler(
        makeEvent({ nickname: "Nubank Black" }, { id: "card-uuid-1" }, ""),
        {} as never,
        () => {},
      ),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should call DynamoDB GetCommand then UpdateCommand with correct keys", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    await handler(makeEvent({ nickname: "Nubank Black" }), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(2);
    const getCmd = mockSend.mock.calls[0][0];
    expect(getCmd.input.Key).toEqual({ PK: "USER#user-123", SK: "CARD#card-uuid-1" });

    const updateCmd = mockSend.mock.calls[1][0];
    expect(updateCmd.input.Key).toEqual({ PK: "USER#user-123", SK: "CARD#card-uuid-1" });
    expect(updateCmd.input.ExpressionAttributeValues[":nickname"]).toBe("Nubank Black");
  });
});
