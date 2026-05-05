import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

const existingItem = {
  PK: "USER#user-123",
  SK: "TX#2026-04-10T12:00:00.000Z#tx-uuid-1",
  id: "tx-uuid-1",
  type: "EXPENSE",
  amount: 45.9,
  category: "FOOD",
  paidVia: "CASH",
  status: "PAID",
  month: "2026-04",
  date: "2026-04-10T12:00:00.000Z",
  deleted: false,
  createdAt: "2026-04-10T12:00:00.000Z",
  updatedAt: "2026-04-10T12:00:00.000Z",
};

function makeEvent(
  pathParameters: Record<string, string> | null = { id: "tx-uuid-1" },
  principalId = "user-123",
): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "DELETE",
    isBase64Encoded: false,
    path: "/api/v1/transactions/tx-uuid-1",
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

describe("deleteTransaction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should soft-delete a transaction and return 200 with message", async () => {
    mockSend.mockResolvedValueOnce({ Items: [existingItem] }).mockResolvedValueOnce({});

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ message: "Transaction deleted" });
  });

  it("should query by PK + TX# prefix and filter by id", async () => {
    mockSend.mockResolvedValueOnce({ Items: [existingItem] }).mockResolvedValueOnce({});

    await handler(makeEvent(), {} as never, () => {});

    const queryCmd = mockSend.mock.calls[0][0];
    expect(queryCmd.input.ExpressionAttributeValues[":pk"]).toBe("USER#user-123");
    expect(queryCmd.input.ExpressionAttributeValues[":prefix"]).toBe("TX#");
    expect(queryCmd.input.ExpressionAttributeValues[":id"]).toBe("tx-uuid-1");
  });

  it("should update using the full SK resolved from the query", async () => {
    mockSend.mockResolvedValueOnce({ Items: [existingItem] }).mockResolvedValueOnce({});

    await handler(makeEvent(), {} as never, () => {});

    const updateCmd = mockSend.mock.calls[1][0];
    expect(updateCmd.input.Key).toEqual({
      PK: "USER#user-123",
      SK: "TX#2026-04-10T12:00:00.000Z#tx-uuid-1",
    });
    expect(updateCmd.input.ExpressionAttributeValues[":deleted"]).toBe(true);
    expect(updateCmd.input.ExpressionAttributeValues[":updatedAt"]).toBeDefined();
  });

  it("should return 404 when transaction is not found", async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    await expect(handler(makeEvent(), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("should return 404 when transaction belongs to a different user", async () => {
    // Query scoped to current user's PK returns nothing — different user's tx is invisible
    mockSend.mockResolvedValueOnce({ Items: [] });

    await expect(
      handler(makeEvent({ id: "tx-uuid-1" }, "other-user"), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("should return 400 when id path param is missing", async () => {
    await expect(handler(makeEvent(null), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should return 401 when principalId is missing", async () => {
    await expect(
      handler(makeEvent({ id: "tx-uuid-1" }, ""), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
