import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

const billPaymentItem = {
  PK: "USER#user-123",
  SK: "TX#2026-04-15T00:00:00.000Z#tx-uuid-1",
  id: "tx-uuid-1",
  type: "BILL_PAYMENT",
  amount: 39.9,
  category: "ENTERTAINMENT",
  paidVia: "CREDIT_CARD#card-uuid-123",
  status: "UNPAID",
  month: "2026-04",
  date: "2026-04-15T00:00:00.000Z",
  deleted: false,
  billId: "bill-uuid-1",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-01T00:00:00.000Z",
};

const expenseItem = {
  ...billPaymentItem,
  id: "tx-uuid-2",
  SK: "TX#2026-04-10T12:00:00.000Z#tx-uuid-2",
  type: "EXPENSE",
  status: "PAID",
};

function makeEvent(
  pathParameters: Record<string, string> | null = { id: "tx-uuid-1" },
  principalId = "user-123",
): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "PUT",
    isBase64Encoded: false,
    path: "/api/v1/transactions/tx-uuid-1/pay",
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

describe("markBillPaid", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should mark a BILL_PAYMENT as paid and return 200 with message", async () => {
    mockSend.mockResolvedValueOnce({ Items: [billPaymentItem] }).mockResolvedValueOnce({});

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ message: "Transaction marked as paid" });
  });

  it("should update status=PAID, paidAt, and updatedAt", async () => {
    mockSend.mockResolvedValueOnce({ Items: [billPaymentItem] }).mockResolvedValueOnce({});

    await handler(makeEvent(), {} as never, () => {});

    const updateCmd = mockSend.mock.calls[1][0];
    expect(updateCmd.input.Key).toEqual({
      PK: "USER#user-123",
      SK: "TX#2026-04-15T00:00:00.000Z#tx-uuid-1",
    });
    expect(updateCmd.input.ExpressionAttributeValues[":status"]).toBe("PAID");
    expect(updateCmd.input.ExpressionAttributeValues[":paidAt"]).toBeDefined();
    expect(updateCmd.input.ExpressionAttributeValues[":updatedAt"]).toBeDefined();
  });

  it("should use ExpressionAttributeNames to alias reserved word 'status'", async () => {
    mockSend.mockResolvedValueOnce({ Items: [billPaymentItem] }).mockResolvedValueOnce({});

    await handler(makeEvent(), {} as never, () => {});

    const updateCmd = mockSend.mock.calls[1][0];
    expect(updateCmd.input.ExpressionAttributeNames).toEqual({ "#status": "status" });
  });

  it("should return 400 when transaction type is EXPENSE", async () => {
    mockSend.mockResolvedValueOnce({ Items: [expenseItem] });

    await expect(
      handler(makeEvent({ id: "tx-uuid-2" }), {} as never, () => {}),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should return 404 when transaction is not found", async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    await expect(handler(makeEvent(), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 404,
    });
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
