import { randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";
import { CATEGORIES, type Transaction } from "../../../types/transactions";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const body = event.body as unknown as Partial<{
    amount: number;
    description: string;
    category: string;
    paidVia: string;
    date: string;
  }>;

  const { amount, description, category, paidVia, date } = body ?? {};

  if (amount === undefined || amount === null || typeof amount !== "number" || amount <= 0) {
    throw createError(400, "amount is required and must be a positive number");
  }

  if (!category || !(CATEGORIES as readonly string[]).includes(category)) {
    throw createError(400, `category must be one of: ${CATEGORIES.join(", ")}`);
  }

  if (!paidVia || typeof paidVia !== "string" || paidVia.trim() === "") {
    throw createError(400, "paidVia is required");
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const resolvedDate = date ?? now;
  const month = resolvedDate.slice(0, 7);
  const sk = `TX#${resolvedDate}#${id}`;

  const transaction: Transaction = {
    id,
    type: "EXPENSE",
    amount,
    ...(description !== undefined && { description }),
    category: category as Transaction["category"],
    paidVia: paidVia.trim(),
    status: "PAID",
    month,
    date: resolvedDate,
    deleted: false,
    paidAt: resolvedDate,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { PK: `USER#${userId}`, SK: sk, ...transaction },
    }),
  );

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  };
};
