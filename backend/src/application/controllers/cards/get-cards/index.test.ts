import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

const cardItem = {
  PK: "USER#user-123",
  SK: "CARD#card-uuid-1",
  id: "card-uuid-1",
  nickname: "Nubank",
  active: true,
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z",
};

const inactiveCardItem = {
  PK: "USER#user-123",
  SK: "CARD#card-uuid-2",
  id: "card-uuid-2",
  nickname: "Inter",
  active: false,
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z",
};

function makeEvent(
  queryStringParameters: Record<string, string> | null = null,
  principalId = "user-123",
): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: "/api/v1/cards",
    pathParameters: null,
    queryStringParameters,
    multiValueQueryStringParameters: null,
    requestContext: {
      authorizer: { principalId },
    } as unknown as APIGatewayProxyEvent["requestContext"],
    resource: "",
    stageVariables: null,
  };
}

describe("getCards", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return only active cards by default (active=true)", async () => {
    mockSend.mockResolvedValue({ Items: [cardItem, inactiveCardItem] });

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("card-uuid-1");
    expect(body[0].active).toBe(true);
  });

  it("should return only active cards when active=true", async () => {
    mockSend.mockResolvedValue({ Items: [cardItem, inactiveCardItem] });

    const result = await handler(makeEvent({ active: "true" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].active).toBe(true);
  });

  it("should return only inactive cards when active=false", async () => {
    mockSend.mockResolvedValue({ Items: [cardItem, inactiveCardItem] });

    const result = await handler(makeEvent({ active: "false" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].active).toBe(false);
  });

  it("should return all cards when active=all", async () => {
    mockSend.mockResolvedValue({ Items: [cardItem, inactiveCardItem] });

    const result = await handler(makeEvent({ active: "all" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const body = JSON.parse(res.body);
    expect(body).toHaveLength(2);
  });

  it("should strip PK and SK from returned items", async () => {
    mockSend.mockResolvedValue({ Items: [cardItem] });

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const body = JSON.parse(res.body);
    expect(body[0].PK).toBeUndefined();
    expect(body[0].SK).toBeUndefined();
  });

  it("should return an empty array when no cards exist", async () => {
    mockSend.mockResolvedValue({ Items: [] });

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(JSON.parse(res.body)).toEqual([]);
  });

  it("should throw 400 for an invalid active param", async () => {
    await expect(
      handler(makeEvent({ active: "maybe" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw 401 when principalId is missing", async () => {
    await expect(handler(makeEvent(null, ""), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
