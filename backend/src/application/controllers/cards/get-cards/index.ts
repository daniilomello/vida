import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";
import type { Card } from "../../../types/cards";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const activeParam = event.queryStringParameters?.active ?? "true";

  if (!["true", "false", "all"].includes(activeParam)) {
    throw createError(400, "active must be true, false, or all");
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: { ":pk": `USER#${userId}`, ":prefix": "CARD#" },
    }),
  );

  type CardItem = Card & { PK: string; SK: string };
  const items = (result.Items ?? []) as CardItem[];

  const cards: Card[] = items
    .filter((item) => {
      if (activeParam === "all") return true;
      return item.active === (activeParam === "true");
    })
    .map(({ PK: _pk, SK: _sk, ...card }) => card as Card);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cards),
  };
};
