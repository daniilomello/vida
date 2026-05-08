import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

const existingItem = {
  PK: "USER#user-123",
  SK: "BILL#bill-uuid-1",
  id: "bill-uuid-1",
  type: "BILL_DEFINITION",
  name: "Netflix",
  amount: 39.9,
  dueDay: 15,
  category: "ENTERTAINMENT",
  paidVia: "CREDIT_CARD#card-uuid-1",
  active: true,
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z",
};

function makeEvent(
  body: unknown,
  pathParameters: Record<string, string> | null = { id: "bill-uuid-1" },
  principalId = "user-123",
): APIGatewayProxyEvent {
  return {
    body: body as unknown as string,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "PUT",
    isBase64Encoded: false,
    path: "/api/v1/bills/bill-uuid-1",
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

describe("updateBill", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should update amount and return 200 with the updated bill", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    const result = await handler(makeEvent({ amount: 45.9 }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.amount).toBe(45.9);
    expect(body.id).toBe("bill-uuid-1");
    expect(body.PK).toBeUndefined();
    expect(body.SK).toBeUndefined();
  });

  it("should update multiple fields and return 200", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    const result = await handler(makeEvent({ amount: 50, dueDay: 20 }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.amount).toBe(50);
    expect(body.dueDay).toBe(20);
  });

  it("should update name and return 200", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    const result = await handler(makeEvent({ name: "Spotify" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).name).toBe("Spotify");
  });

  it("should update category and return 200", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    const result = await handler(makeEvent({ category: "FOOD" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).category).toBe("FOOD");
  });

  it("should update paidVia and return 200", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    const result = await handler(makeEvent({ paidVia: "CASH" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).paidVia).toBe("CASH");
  });

  it("should throw 400 when no fields are provided", async () => {
    await expect(handler(makeEvent({}), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw 400 when category is invalid", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem });

    await expect(
      handler(makeEvent({ category: "INVALID" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw 404 when bill does not exist", async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined });

    await expect(handler(makeEvent({ amount: 50 }), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("should throw 401 when principalId is missing", async () => {
    await expect(
      handler(makeEvent({ amount: 50 }, { id: "bill-uuid-1" }, ""), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should call DynamoDB GetCommand then UpdateCommand with correct keys", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    await handler(makeEvent({ amount: 45.9 }), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(2);
    const getCmd = mockSend.mock.calls[0][0];
    expect(getCmd.input.Key).toEqual({ PK: "USER#user-123", SK: "BILL#bill-uuid-1" });

    const updateCmd = mockSend.mock.calls[1][0];
    expect(updateCmd.input.Key).toEqual({ PK: "USER#user-123", SK: "BILL#bill-uuid-1" });
    expect(updateCmd.input.ExpressionAttributeValues[":amount"]).toBe(45.9);
  });
});
