import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

const billItem = {
  PK: "USER#user-123",
  SK: "BILL#bill-uuid-1",
  id: "bill-uuid-1",
  type: "BILL_DEFINITION",
  name: "Netflix",
  amount: 39.9,
  dueDay: 15,
  category: "ENTERTAINMENT",
  paidVia: "CREDIT_CARD#card-uuid-123",
  active: true,
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z",
};

const inactiveBillItem = {
  PK: "USER#user-123",
  SK: "BILL#bill-uuid-2",
  id: "bill-uuid-2",
  type: "BILL_DEFINITION",
  name: "Spotify",
  amount: 19.9,
  dueDay: 10,
  category: "ENTERTAINMENT",
  paidVia: "CASH",
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
    path: "/api/v1/bills",
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

describe("getBills", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return only active bills by default (active=true)", async () => {
    mockSend.mockResolvedValue({ Items: [billItem, inactiveBillItem] });

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("bill-uuid-1");
    expect(body[0].active).toBe(true);
  });

  it("should return only active bills when active=true", async () => {
    mockSend.mockResolvedValue({ Items: [billItem, inactiveBillItem] });

    const result = await handler(makeEvent({ active: "true" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].active).toBe(true);
  });

  it("should return only inactive bills when active=false", async () => {
    mockSend.mockResolvedValue({ Items: [billItem, inactiveBillItem] });

    const result = await handler(makeEvent({ active: "false" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].active).toBe(false);
  });

  it("should return all bills when active=all", async () => {
    mockSend.mockResolvedValue({ Items: [billItem, inactiveBillItem] });

    const result = await handler(makeEvent({ active: "all" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const body = JSON.parse(res.body);
    expect(body).toHaveLength(2);
  });

  it("should strip PK and SK from returned items", async () => {
    mockSend.mockResolvedValue({ Items: [billItem] });

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    const body = JSON.parse(res.body);
    expect(body[0].PK).toBeUndefined();
    expect(body[0].SK).toBeUndefined();
  });

  it("should return an empty array when no bills exist", async () => {
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
