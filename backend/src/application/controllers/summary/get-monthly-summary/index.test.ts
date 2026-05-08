import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

const txExpense = {
  PK: "USER#user-123",
  SK: "TX#2026-04-10T12:00:00.000Z#tx-1",
  id: "tx-1",
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

const txBillPayment = {
  PK: "USER#user-123",
  SK: "TX#2026-04-15T00:00:00.000Z#tx-2",
  id: "tx-2",
  type: "BILL_PAYMENT" as const,
  amount: 39.9,
  category: "ENTERTAINMENT" as const,
  paidVia: "CREDIT_CARD#card-uuid-123",
  status: "UNPAID" as const,
  month: "2026-04",
  date: "2026-04-15T00:00:00.000Z",
  deleted: false,
  createdAt: "2026-04-15T00:00:00.000Z",
  updatedAt: "2026-04-15T00:00:00.000Z",
};

const txDeleted = {
  ...txExpense,
  SK: "TX#2026-04-11T12:00:00.000Z#tx-3",
  id: "tx-3",
  amount: 100,
  deleted: true,
};

const cardItem = {
  PK: "USER#user-123",
  SK: "CARD#card-uuid-123",
  id: "card-uuid-123",
  nickname: "Nubank",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
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
    path: "/api/v1/summary",
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

describe("getMonthlySummary", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return totalSpent, byCategory, and byPaymentMethod for the given month", async () => {
    mockSend
      .mockResolvedValueOnce({ Items: [txExpense, txBillPayment] })
      .mockResolvedValueOnce({ Items: [cardItem] });

    const result = await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.month).toBe("2026-04");
    expect(body.totalSpent).toBeCloseTo(85.8);

    expect(body.byCategory).toEqual(
      expect.arrayContaining([
        { category: "FOOD", total: 45.9 },
        { category: "ENTERTAINMENT", total: 39.9 },
      ]),
    );

    expect(body.byPaymentMethod).toEqual(
      expect.arrayContaining([
        { paidVia: "CASH", total: 45.9 },
        { paidVia: "CREDIT_CARD#card-uuid-123", total: 39.9, nickname: "Nubank" },
      ]),
    );
  });

  it("should exclude soft-deleted transactions from the summary", async () => {
    mockSend
      .mockResolvedValueOnce({ Items: [txExpense, txDeleted] })
      .mockResolvedValueOnce({ Items: [cardItem] });

    const result = await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    expect(body.totalSpent).toBeCloseTo(45.9);
    expect(body.byCategory).toHaveLength(1);
  });

  it("should default to current month when month param is omitted", async () => {
    mockSend.mockResolvedValue({ Items: [] });

    await handler(makeEvent(), {} as never, () => {});

    const txCall = mockSend.mock.calls[0][0];
    expect(txCall.input.ExpressionAttributeValues[":prefix"]).toMatch(/^TX#\d{4}-\d{2}$/);
  });

  it("should return zeros and empty arrays when no transactions exist", async () => {
    mockSend.mockResolvedValue({ Items: [] });

    const result = await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    expect(body.totalSpent).toBe(0);
    expect(body.byCategory).toEqual([]);
    expect(body.byPaymentMethod).toEqual([]);
  });

  it("should not include nickname for non-credit-card payment methods", async () => {
    mockSend
      .mockResolvedValueOnce({ Items: [txExpense] })
      .mockResolvedValueOnce({ Items: [cardItem] });

    const result = await handler(makeEvent({ month: "2026-04" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    const cashEntry = body.byPaymentMethod.find((p: { paidVia: string }) => p.paidVia === "CASH");
    expect(cashEntry.nickname).toBeUndefined();
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
