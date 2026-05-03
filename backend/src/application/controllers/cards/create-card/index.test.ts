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
    path: "/api/v1/cards",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    requestContext: {
      authorizer: { principalId },
    } as APIGatewayProxyEvent["requestContext"],
    resource: "",
    stageVariables: null,
  };
}

describe("createCard", () => {
  beforeEach(() => {
    mockSend.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a card and return 201 with the card object", async () => {
    const result = await handler(makeEvent({ nickname: "Nubank" }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.body);
    expect(body.nickname).toBe("Nubank");
    expect(body.active).toBe(true);
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
    expect(body.updatedAt).toBeDefined();
  });

  it("should trim whitespace from nickname", async () => {
    const result = await handler(makeEvent({ nickname: "  Inter  " }), {} as never, () => {});
    const res = result as Exclude<typeof result, void>;

    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body).nickname).toBe("Inter");
  });

  it("should throw 400 when nickname is missing", async () => {
    await expect(handler(makeEvent({}), {} as never, () => {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("should throw 400 when nickname is an empty string", async () => {
    await expect(
      handler(makeEvent({ nickname: "   " }), {} as never, () => {}),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("should throw 401 when principalId is missing", async () => {
    const event = makeEvent({ nickname: "Nubank" }, "");
    await expect(handler(event, {} as never, () => {})).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("should call DynamoDB PutCommand with correct PK and SK", async () => {
    await handler(makeEvent({ nickname: "Nubank" }), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(1);
    const command = mockSend.mock.calls[0][0];
    expect(command.input.TableName).toBe("TestTable");
    expect(command.input.Item.PK).toBe("USER#user-123");
    expect(command.input.Item.SK).toMatch(/^CARD#/);
  });
});
