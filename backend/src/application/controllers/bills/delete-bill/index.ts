import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const id = event.pathParameters?.id;
  if (!id) throw createError(400, "id is required");

  const PK = `USER#${userId}`;
  const SK = `BILL#${id}`;

  const existing = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } }));

  if (!existing.Item) throw createError(404, "Bill not found");

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK, SK },
      UpdateExpression: "SET active = :active, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":active": false,
        ":updatedAt": new Date().toISOString(),
      },
    }),
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Bill deactivated" }),
  };
};
