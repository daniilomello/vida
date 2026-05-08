const mockSend = jest.fn();

jest.mock("../../../clients/dynamodb", () => ({
  docClient: { send: mockSend },
  TABLE_NAME: "TestTable",
}));

import { handler } from ".";

function makeEvent(): Parameters<typeof handler>[0] {
  return {
    version: "0",
    id: "test-event-id",
    "detail-type": "Scheduled Event",
    source: "aws.events",
    account: "123456789012",
    time: "2026-05-01T00:00:00Z",
    region: "us-east-1",
    resources: [],
    detail: {},
  } as unknown as Parameters<typeof handler>[0];
}

const activeBill = {
  PK: "USER#user-123",
  SK: "BILL#bill-uuid-1",
  id: "bill-uuid-1",
  type: "BILL_DEFINITION",
  name: "Netflix",
  amount: 39.9,
  dueDay: 15,
  category: "ENTERTAINMENT",
  paidVia: "CASH",
  active: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("generateMonthlyBills", () => {
  let realDate: DateConstructor;

  beforeAll(() => {
    realDate = global.Date;
    const fixedDate = new Date("2026-05-01T00:00:00.000Z");
    global.Date = class extends Date {
      constructor(...args: ConstructorParameters<DateConstructor>) {
        if (args.length === 0) {
          super(fixedDate.toISOString());
        } else {
          // @ts-expect-error
          super(...args);
        }
      }
      static now() {
        return fixedDate.getTime();
      }
    } as unknown as DateConstructor;
  });

  afterAll(() => {
    global.Date = realDate;
  });

  beforeEach(() => {
    mockSend.mockReset();
  });

  it("should generate a BILL_PAYMENT transaction for each active bill", async () => {
    mockSend
      .mockResolvedValueOnce({ Items: [activeBill] }) // GSI-Type query
      .mockResolvedValueOnce({ Items: [] }) // idempotency check
      .mockResolvedValueOnce({}); // PutCommand

    await handler(makeEvent(), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(3);

    const putCall = mockSend.mock.calls[2][0];
    expect(putCall.input.TableName).toBe("TestTable");
    expect(putCall.input.Item.PK).toBe("USER#user-123");
    expect(putCall.input.Item.SK).toMatch(/^TX#2026-05-15#/);
    expect(putCall.input.Item.type).toBe("BILL_PAYMENT");
    expect(putCall.input.Item.status).toBe("UNPAID");
    expect(putCall.input.Item.amount).toBe(39.9);
    expect(putCall.input.Item.billId).toBe("BILL#bill-uuid-1");
    expect(putCall.input.Item.month).toBe("2026-05");
    expect(putCall.input.Item.date).toBe("2026-05-15");
    expect(putCall.input.Item.deleted).toBe(false);
  });

  it("should skip generation when BILL_PAYMENT already exists for the month (idempotency)", async () => {
    mockSend
      .mockResolvedValueOnce({ Items: [activeBill] })
      .mockResolvedValueOnce({ Items: [{ id: "existing-tx" }] }); // already exists

    await handler(makeEvent(), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(2);
    const calls = mockSend.mock.calls.map((c) => c[0].constructor.name);
    expect(calls).not.toContain("PutCommand");
  });

  it("should skip inactive bills", async () => {
    const inactiveBill = { ...activeBill, active: false };
    mockSend.mockResolvedValueOnce({ Items: [inactiveBill] });

    // GSI FilterExpression handles active=true, so it won't return inactive bills.
    // But even if it did (e.g. eventual consistency), test that no insert happens.
    await handler(makeEvent(), {} as never, () => {});

    // Only the GSI query was called; no idempotency check or put
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should handle empty bills list gracefully", async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    await handler(makeEvent(), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should clamp dueDay=31 to last day of February (28 in non-leap year)", async () => {
    const realDate2 = global.Date;
    const feb = new Date("2026-02-01T00:00:00.000Z");
    global.Date = class extends Date {
      constructor(...args: ConstructorParameters<DateConstructor>) {
        if (args.length === 0) {
          super(feb.toISOString());
        } else {
          // @ts-expect-error
          super(...args);
        }
      }
      static now() {
        return feb.getTime();
      }
    } as unknown as DateConstructor;

    const billWith31 = { ...activeBill, dueDay: 31 };
    mockSend
      .mockResolvedValueOnce({ Items: [billWith31] })
      .mockResolvedValueOnce({ Items: [] })
      .mockResolvedValueOnce({});

    await handler(makeEvent(), {} as never, () => {});

    const putCall = mockSend.mock.calls[2][0];
    expect(putCall.input.Item.date).toBe("2026-02-28");
    expect(putCall.input.Item.SK).toMatch(/^TX#2026-02-28#/);

    global.Date = realDate2;
  });

  it("should query GSI-Type with correct key and filter", async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });

    await handler(makeEvent(), {} as never, () => {});

    const gsiQuery = mockSend.mock.calls[0][0];
    expect(gsiQuery.input.IndexName).toBe("GSI-Type");
    expect(gsiQuery.input.ExpressionAttributeValues[":type"]).toBe("BILL_DEFINITION");
    expect(gsiQuery.input.ExpressionAttributeValues[":active"]).toBe(true);
  });

  it("should process multiple bills independently", async () => {
    const bill2 = {
      ...activeBill,
      PK: "USER#user-456",
      SK: "BILL#bill-uuid-2",
      id: "bill-uuid-2",
      name: "Spotify",
      amount: 19.9,
      dueDay: 10,
    };

    mockSend
      .mockResolvedValueOnce({ Items: [activeBill, bill2] })
      .mockResolvedValueOnce({ Items: [] }) // idempotency bill1
      .mockResolvedValueOnce({}) // put bill1
      .mockResolvedValueOnce({ Items: [] }) // idempotency bill2
      .mockResolvedValueOnce({}); // put bill2

    await handler(makeEvent(), {} as never, () => {});

    expect(mockSend).toHaveBeenCalledTimes(5);
    const put1 = mockSend.mock.calls[2][0];
    const put2 = mockSend.mock.calls[4][0];
    expect(put1.input.Item.date).toBe("2026-05-15");
    expect(put2.input.Item.date).toBe("2026-05-10");
  });
});
