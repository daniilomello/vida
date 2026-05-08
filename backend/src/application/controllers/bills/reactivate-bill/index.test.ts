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
  active: false,
  createdAt: "2026-04-25T00:00:00.000Z",
  updatedAt: "2026-04-25T00:00:00.000Z",
};

function makeEvent(
  pathParameters: Record<string, string> | null = { id: "bill-uuid-1" },
  principalId = "user-123",
): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "PUT",
    isBase64Encoded: false,
    path: "/api/v1/bills/bill-uuid-1/reactivate",
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

describe("reactivateBill", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reactivate a bill and return 200 with message", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    const result = await handler(makeEvent(), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ message: "Bill reactivated" });
  });

  it("should throw 404 when bill does not exist", async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined });

    await expect(handler(makeEvent(), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("should throw 401 when principalId is missing", async () => {
    await expect(
      handler(makeEvent({ id: "bill-uuid-1" }, ""), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should call DynamoDB GetCommand then UpdateCommand setting active=true", async () => {
    mockSend.mockResolvedValueOnce({ Item: existingItem }).mockResolvedValueOnce({});

    await handler(makeEvent(), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(2);
    const getCmd = mockSend.mock.calls[0][0];
    expect(getCmd.input.Key).toEqual({ PK: "USER#user-123", SK: "BILL#bill-uuid-1" });

    const updateCmd = mockSend.mock.calls[1][0];
    expect(updateCmd.input.Key).toEqual({ PK: "USER#user-123", SK: "BILL#bill-uuid-1" });
    expect(updateCmd.input.ExpressionAttributeValues[":active"]).toBe(true);
  });
});
