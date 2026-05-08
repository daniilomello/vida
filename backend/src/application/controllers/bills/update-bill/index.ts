import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";
import { BILL_CATEGORIES } from "../../../types/bills";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const id = event.pathParameters?.id;
  if (!id) throw createError(400, "id is required");

  const body = event.body as unknown as Partial<{
    name: string;
    amount: number;
    dueDay: number;
    category: string;
    paidVia: string;
  }>;

  const { name, amount, dueDay, category, paidVia } = body ?? {};

  if (
    name === undefined &&
    amount === undefined &&
    dueDay === undefined &&
    category === undefined &&
    paidVia === undefined
  ) {
    throw createError(400, "At least one field is required");
  }

  if (
    category !== undefined &&
    !BILL_CATEGORIES.includes(category as (typeof BILL_CATEGORIES)[number])
  ) {
    throw createError(400, `category must be one of: ${BILL_CATEGORIES.join(", ")}`);
  }

  const PK = `USER#${userId}`;
  const SK = `BILL#${id}`;

  const existing = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } }));

  if (!existing.Item) throw createError(404, "Bill not found");

  const updatedAt = new Date().toISOString();

  const expressionParts: string[] = ["updatedAt = :updatedAt"];
  const expressionValues: Record<string, unknown> = { ":updatedAt": updatedAt };

  if (name !== undefined) {
    expressionParts.push("#name = :name");
    expressionValues[":name"] = name;
  }
  if (amount !== undefined) {
    expressionParts.push("amount = :amount");
    expressionValues[":amount"] = amount;
  }
  if (dueDay !== undefined) {
    expressionParts.push("dueDay = :dueDay");
    expressionValues[":dueDay"] = dueDay;
  }
  if (category !== undefined) {
    expressionParts.push("category = :category");
    expressionValues[":category"] = category;
  }
  if (paidVia !== undefined) {
    expressionParts.push("paidVia = :paidVia");
    expressionValues[":paidVia"] = paidVia;
  }

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: `SET ${expressionParts.join(", ")}`,
      ExpressionAttributeNames: name !== undefined ? { "#name": "name" } : undefined,
      ExpressionAttributeValues: expressionValues,
    }),
  );

  const { PK: _pk, SK: _sk, ...bill } = existing.Item as Record<string, unknown>;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...bill,
      ...(name !== undefined && { name }),
      ...(amount !== undefined && { amount }),
      ...(dueDay !== undefined && { dueDay }),
      ...(category !== undefined && { category }),
      ...(paidVia !== undefined && { paidVia }),
      updatedAt,
    }),
  };
};
