import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";
import type { Card } from "../../../types/cards";
import type { Transaction } from "../../../types/transactions";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const now = new Date().toISOString();
  const month = event.queryStringParameters?.month ?? now.slice(0, 7);

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw createError(400, "month must be in YYYY-MM format");
  }

  const [txResult, cardResult] = await Promise.all([
    docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": `TX#${month}`,
        },
      }),
    ),
    docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: { ":pk": `USER#${userId}`, ":prefix": "CARD#" },
      }),
    ),
  ]);

  type TxItem = Transaction & { PK: string; SK: string };
  type CardItem = Card & { PK: string; SK: string };

  const transactions = ((txResult.Items ?? []) as TxItem[]).filter((t) => !t.deleted);
  const cardMap = new Map(((cardResult.Items ?? []) as CardItem[]).map((c) => [c.id, c.nickname]));

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals = new Map<string, number>();
  for (const t of transactions) {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) ?? 0) + t.amount);
  }
  const byCategory = Array.from(categoryTotals.entries()).map(([category, total]) => ({
    category,
    total,
  }));

  const paymentTotals = new Map<string, number>();
  for (const t of transactions) {
    paymentTotals.set(t.paidVia, (paymentTotals.get(t.paidVia) ?? 0) + t.amount);
  }
  const byPaymentMethod = Array.from(paymentTotals.entries()).map(([paidVia, total]) => {
    const entry: { paidVia: string; total: number; nickname?: string } = { paidVia, total };
    if (paidVia.startsWith("CREDIT_CARD#")) {
      const cardId = paidVia.split("#")[1];
      const nickname = cardMap.get(cardId);
      if (nickname) entry.nickname = nickname;
    }
    return entry;
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ month, totalSpent, byCategory, byPaymentMethod }),
  };
};
