import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const id = event.pathParameters?.id;
  if (!id) throw createError(400, "id is required");

  const PK = `USER#${userId}`;

  // TX SK embeds the datetime, so we can't GetCommand by UUID alone — query by PK
  // and filter by id to resolve the full SK.
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      FilterExpression: "id = :id",
      ExpressionAttributeValues: {
        ":pk": PK,
        ":prefix": "TX#",
        ":id": id,
      },
    }),
  );

  const item = result.Items?.[0];
  if (!item) throw createError(404, "Transaction not found");

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK: item.SK },
      UpdateExpression: "SET deleted = :deleted, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":deleted": true,
        ":updatedAt": new Date().toISOString(),
      },
    }),
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Transaction deleted" }),
  };
};
