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
    path: "/api/v1/bills",
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

const validBillBody = {
  name: "Netflix",
  amount: 39.9,
  dueDay: 15,
  category: "ENTERTAINMENT",
  paidVia: "CREDIT_CARD#card-uuid-123",
};

describe("createBill", () => {
  beforeEach(() => {
    mockSend.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a bill and return 201 with the bill object", async () => {
    const result = await handler(makeEvent(validBillBody), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.name).toBe("Netflix");
    expect(body.type).toBe("BILL_DEFINITION");
    expect(body.amount).toBe(39.9);
    expect(body.dueDay).toBe(15);
    expect(body.category).toBe("ENTERTAINMENT");
    expect(body.paidVia).toBe("CREDIT_CARD#card-uuid-123");
    expect(body.active).toBe(true);
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("should trim whitespace from name and paidVia", async () => {
    const result = await handler(
      makeEvent({ ...validBillBody, name: "  Spotify  ", paidVia: "  CASH  " }),
      {} as never,
      () => {},
    );
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.name).toBe("Spotify");
    expect(body.paidVia).toBe("CASH");
  });

  it("should throw 400 when name is missing", async () => {
    const { name: _n, ...rest } = validBillBody;
    await expect(handler(makeEvent(rest), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw 400 when name is an empty string", async () => {
    await expect(
      handler(makeEvent({ ...validBillBody, name: "   " }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw 400 when amount is missing", async () => {
    const { amount: _a, ...rest } = validBillBody;
    await expect(handler(makeEvent(rest), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw 400 when dueDay is below 1", async () => {
    await expect(
      handler(makeEvent({ ...validBillBody, dueDay: 0 }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw 400 when dueDay is above 31", async () => {
    await expect(
      handler(makeEvent({ ...validBillBody, dueDay: 32 }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw 400 when category is invalid", async () => {
    await expect(
      handler(makeEvent({ ...validBillBody, category: "INVALID" }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw 400 when category is missing", async () => {
    const { category: _c, ...rest } = validBillBody;
    await expect(handler(makeEvent(rest), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw 400 when paidVia is missing", async () => {
    const { paidVia: _p, ...rest } = validBillBody;
    await expect(handler(makeEvent(rest), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw 401 when principalId is missing", async () => {
    await expect(
      handler(makeEvent(validBillBody, ""), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should call DynamoDB PutCommand with correct PK and SK", async () => {
    await handler(makeEvent(validBillBody), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(1);
    const command = mockSend.mock.calls[0][0];
    expect(command.input.TableName).toBe("TestTable");
    expect(command.input.Item.PK).toBe("USER#user-123");
    expect(command.input.Item.SK).toMatch(/^BILL#/);
    expect(command.input.Item.type).toBe("BILL_DEFINITION");
  });

  it("should accept all valid category values", async () => {
    const categories = [
      "FOOD",
      "TRANSPORT",
      "UTILITIES",
      "ENTERTAINMENT",
      "HEALTH",
      "HOUSING",
      "OTHER",
    ];
    for (const category of categories) {
      mockSend.mockResolvedValue({});
      const result = await handler(
        makeEvent({ ...validBillBody, category }),
        {} as never,
        () => {},
      );
      const res = result as Exclude<typeof result, void>;
      expect(res.statusCode).toBe(201);
    }
  });
});
