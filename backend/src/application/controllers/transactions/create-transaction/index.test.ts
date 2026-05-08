import type { APIGatewayProxyEvent } from "aws-lambda";

const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

function makeEvent(body: unknown, principalId = "user-123"): APIGatewayProxyEvent {
  return {
    body: body as unknown as string,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "POST",
    isBase64Encoded: false,
    path: "/api/v1/transactions",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    requestContext: {
      authorizer: { principalId },
    } as unknown as APIGatewayProxyEvent["requestContext"],
    resource: "",
    stageVariables: null,
  };
}

describe("createTransaction", () => {
  beforeEach(() => {
    mockSend.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a transaction and return 201 with the transaction object", async () => {
    const result = await handler(
      makeEvent({ amount: 45.9, category: "FOOD", paidVia: "CASH" }),
      {} as never,
      () => {},
    );
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.type).toBe("EXPENSE");
    expect(body.status).toBe("PAID");
    expect(body.amount).toBe(45.9);
    expect(body.category).toBe("FOOD");
    expect(body.paidVia).toBe("CASH");
    expect(body.deleted).toBe(false);
    expect(body.id).toBeDefined();
    expect(body.month).toBeDefined();
    expect(body.date).toBeDefined();
    expect(body.paidAt).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("should derive month from date when date is provided", async () => {
    const result = await handler(
      makeEvent({
        amount: 10,
        category: "FOOD",
        paidVia: "DEBIT",
        date: "2026-03-15T10:00:00.000Z",
      }),
      {} as never,
      () => {},
    );
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    expect(body.month).toBe("2026-03");
    expect(body.date).toBe("2026-03-15T10:00:00.000Z");
  });

  it("should default date to current datetime when not provided", async () => {
    const before = new Date().toISOString().slice(0, 10);
    const result = await handler(
      makeEvent({ amount: 10, category: "FOOD", paidVia: "CASH" }),
      {} as never,
      () => {},
    );
    const res = result as Exclude<typeof result, void>;
    const body = JSON.parse(res.body);

    expect(body.date.slice(0, 10)).toBe(before);
  });

  it("should include optional description when provided", async () => {
    const result = await handler(
      makeEvent({ amount: 25, category: "FOOD", paidVia: "CASH", description: "Lunch" }),
      {} as never,
      () => {},
    );
    const res = result as Exclude<typeof result, void>;
    expect(JSON.parse(res.body).description).toBe("Lunch");
  });

  it("should return 400 when amount is missing", async () => {
    await expect(
      handler(makeEvent({ category: "FOOD", paidVia: "CASH" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should return 400 when amount is zero", async () => {
    await expect(
      handler(makeEvent({ amount: 0, category: "FOOD", paidVia: "CASH" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should return 400 when amount is negative", async () => {
    await expect(
      handler(makeEvent({ amount: -5, category: "FOOD", paidVia: "CASH" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should return 400 for an invalid category", async () => {
    await expect(
      handler(
        makeEvent({ amount: 10, category: "INVALID", paidVia: "CASH" }),
        {} as never,
        () => {},
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should return 400 when paidVia is missing", async () => {
    await expect(
      handler(makeEvent({ amount: 10, category: "FOOD" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should return 401 when principalId is missing", async () => {
    await expect(
      handler(
        makeEvent({ amount: 10, category: "FOOD", paidVia: "CASH" }, ""),
        {} as never,
        () => {},
      ),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should call DynamoDB PutCommand with correct PK and SK format", async () => {
    await handler(
      makeEvent({ amount: 10, category: "FOOD", paidVia: "CASH" }),
      {} as never,
      () => {},
    );

    expect(mockSend).toHaveBeenCalledTimes(1);
    const command = mockSend.mock.calls[0][0];
    expect(command.input.TableName).toBe("TestTable");
    expect(command.input.Item.PK).toBe("USER#user-123");
    expect(command.input.Item.SK).toMatch(/^TX#/);
  });
});
