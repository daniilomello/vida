import { randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";
import { BILL_CATEGORIES, type Bill } from "../../../types/bills";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const body = event.body as unknown as Partial<{
    name: string;
    amount: number;
    dueDay: number;
    category: string;
    paidVia: string;
  }>;

  const { name, amount, dueDay, category, paidVia } = body ?? {};

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw createError(400, "name is required");
  }

  if (amount === undefined || typeof amount !== "number" || Number.isNaN(amount)) {
    throw createError(400, "amount is required and must be a number");
  }

  if (dueDay === undefined || typeof dueDay !== "number" || dueDay < 1 || dueDay > 31) {
    throw createError(400, "dueDay is required and must be between 1 and 31");
  }

  if (!category || !BILL_CATEGORIES.includes(category as (typeof BILL_CATEGORIES)[number])) {
    throw createError(400, `category must be one of: ${BILL_CATEGORIES.join(", ")}`);
  }

  if (!paidVia || typeof paidVia !== "string" || paidVia.trim() === "") {
    throw createError(400, "paidVia is required");
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  const bill: Bill = {
    id,
    type: "BILL_DEFINITION",
    name: name.trim(),
    amount,
    dueDay,
    category: category as Bill["category"],
    paidVia: paidVia.trim(),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { PK: `USER#${userId}`, SK: `BILL#${id}`, ...bill },
    }),
  );

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bill),
  };
};
