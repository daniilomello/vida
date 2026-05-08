import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyHandler } from "aws-lambda";
import { docClient, TABLE_NAME } from "../../../clients/dynamodb";
import { createError } from "../../../errors";
import type { Transaction } from "../../../types/transactions";

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.principalId;
  if (!userId) throw createError(401, "Unauthorized");

  const now = new Date().toISOString();
  const month = event.queryStringParameters?.month ?? now.slice(0, 7);
  const paidVia = event.queryStringParameters?.paidVia;

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw createError(400, "month must be in YYYY-MM format");
  }

  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":prefix": `TX#${month}`,
      },
    }),
  );

  type TxItem = Transaction & { PK: string; SK: string };
  const items = (result.Items ?? []) as TxItem[];

  const transactions: Transaction[] = items
    .filter((item) => {
      if (item.deleted) return false;
      if (paidVia && item.paidVia !== paidVia) return false;
      return true;
    })
    .map(({ PK: _pk, SK: _sk, ...tx }) => tx as Transaction);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transactions),
  };
};
