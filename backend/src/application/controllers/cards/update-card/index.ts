import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const id = event.pathParameters?.id;
  if (!id) throw createError(400, "id is required");

  const body = event.body as unknown as Partial<{ nickname: string }>;
  const { nickname } = body ?? {};

  if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
    throw createError(400, "nickname is required");
  }

  const PK = `USER#${userId}`;
  const SK = `CARD#${id}`;

  const existing = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } }));

  if (!existing.Item) throw createError(404, "Card not found");

  const updatedAt = new Date().toISOString();
  const trimmedNickname = nickname.trim();

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: "SET nickname = :nickname, updatedAt = :updatedAt",
      ExpressionAttributeValues: { ":nickname": trimmedNickname, ":updatedAt": updatedAt },
    }),
  );

  const { PK: _pk, SK: _sk, ...card } = existing.Item as Record<string, unknown>;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...card, nickname: trimmedNickname, updatedAt }),
  };
};
