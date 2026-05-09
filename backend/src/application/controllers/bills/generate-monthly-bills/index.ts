import { randomUUID } from "node:crypto";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { ScheduledHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import type { Bill } from "../../../types/bills";
import type { Transaction } from "../../../types/transactions";

function clampDueDay(dueDay: number, year: number, month: number): number {
  const lastDay = new Date(year, month, 0).getDate();
  return Math.min(dueDay, lastDay);
}

export const handler: ScheduledHandler = async () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  const billsResult = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI-Type",
      KeyConditionExpression: "#type = :type",
      FilterExpression: "active = :active",
      ExpressionAttributeNames: { "#type": "type" },
      ExpressionAttributeValues: { ":type": "BILL_DEFINITION", ":active": true },
    }),
  );

  type BillItem = Bill & { PK: string; SK: string };
  const bills = (billsResult.Items ?? []) as BillItem[];

  for (const bill of bills) {
    if (!bill.active) continue;

    const userId = bill.PK.replace("USER#", "");
    const billId = bill.SK;

    const existing = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        FilterExpression: "billId = :billId AND #month = :month AND #type = :type",
        ExpressionAttributeNames: { "#month": "month", "#type": "type" },
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": `TX#${monthStr}`,
          ":billId": billId,
          ":month": monthStr,
          ":type": "BILL_PAYMENT",
        },
      }),
    );

    if ((existing.Items ?? []).length > 0) continue;

    const clampedDay = clampDueDay(bill.dueDay, year, month);
    const dateStr = `${monthStr}-${String(clampedDay).padStart(2, "0")}`;
    const id = randomUUID();
    const nowIso = new Date().toISOString();

    const transaction: Transaction = {
      id,
      type: "BILL_PAYMENT",
      amount: bill.amount,
      description: bill.name,
      category: bill.category,
      paidVia: bill.paidVia,
      status: "UNPAID",
      month: monthStr,
      date: dateStr,
      deleted: false,
      billId,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { PK: `USER#${userId}`, SK: `TX#${dateStr}#${id}`, ...transaction },
      }),
    );
  }
};
