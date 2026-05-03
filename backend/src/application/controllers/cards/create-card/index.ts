import { randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";
import type { Card } from "../../../types/cards";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const body = event.body as unknown as Partial<{ nickname: string }>;
  const { nickname } = body ?? {};

  if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
    throw createError(400, "nickname is required");
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  const card: Card = {
    id,
    nickname: nickname.trim(),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { PK: `USER#${userId}`, SK: `CARD#${id}`, ...card },
    }),
  );

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  };
};
