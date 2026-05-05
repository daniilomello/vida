import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

const txBase = {
  PK: "USER#user-123",
  id: "tx-uuid-1",
  type: "EXPENSE" as const,
  amount: 45.9,
  category: "FOOD" as const,
  paidVia: "CASH",
  status: "PAID" as const,
  month: "2026-04",
  date: "2026-04-10T12:00:00.000Z",
  deleted: false,
  paidAt: "2026-04-10T12:00:00.000Z",
  createdAt: "2026-04-10T12:00:00.000Z",
  updatedAt: "2026-04-10T12:00:00.000Z",
};

const txItem = { ...txBase, SK: "TX#2026-04-10T12:00:00.000Z#tx-uuid-1" };
const txItemDeleted = {
  ...txBase,
  SK: "TX#2026-04-10T13:00:00.000Z#tx-uuid-2",
  id: "tx-uuid-2",
  deleted: true,
};
const txItemCard = {
  ...txBase,
  SK: "TX#2026-04-15T10:00:00.000Z#tx-uuid-3",
  id: "tx-uuid-3",
  paidVia: "CREDIT_CARD#card-uuid-123",
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
    path: "/api/v1/transactions",
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

describe("getTransactions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return transactions for the current month when no month param is given", async () => {
    mockSend.mockResolvedValue({ Items: [txItem] });

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body)).toBe(true);

    const command = mockSend.mock.calls[0][0];
    expect(command.input.ExpressionAttributeValues[":prefix"]).toMatch(/^TX#\d{4}-\d{2}$/);
  });

  it("should query with the provided month prefix", async () => {
    mockSend.mockResolvedValue({ Items: [txItem] });

    await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});

    const command = mockSend.mock.calls[0][0];
    expect(command.input.ExpressionAttributeValues[":prefix"]).toBe("TX#2026-04");
    expect(command.input.ExpressionAttributeValues[":pk"]).toBe("USER#user-123");
  });

  it("should exclude soft-deleted transactions", async () => {
    mockSend.mockResolvedValue({ Items: [txItem, txItemDeleted] });

    const result = await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("tx-uuid-1");
  });

  it("should filter by paidVia when provided", async () => {
    mockSend.mockResolvedValue({ Items: [txItem, txItemCard] });

    const result = await handler(
      makeEvent({ month: "2026-04", paidVia: "CREDIT_CARD#card-uuid-123" }),
      {} as never,
      () => {},
    );
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    expect(body).toHaveLength(1);
    expect(body[0].paidVia).toBe("CREDIT_CARD#card-uuid-123");
  });

  it("should return all non-deleted transactions when paidVia is not provided", async () => {
    mockSend.mockResolvedValue({ Items: [txItem, txItemCard] });

    const result = await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    expect(body).toHaveLength(2);
  });

  it("should strip PK and SK from returned items", async () => {
    mockSend.mockResolvedValue({ Items: [txItem] });

    const result = await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    expect(body[0].PK).toBeUndefined();
    expect(body[0].SK).toBeUndefined();
    expect(body[0].id).toBe("tx-uuid-1");
  });

  it("should return an empty array when no transactions exist", async () => {
    mockSend.mockResolvedValue({ Items: [] });

    const result = await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(JSON.parse(res.body)).toEqual([]);
  });

  it("should return 400 for an invalid month format", async () => {
    await expect(
      handler(makeEvent({ month: "April-2026" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should return 401 when principalId is missing", async () => {
    await expect(handler(makeEvent(null, ""), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});
