import type { MiddyHandlerObject } from "@middy/core";
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

/** Middy v7 handlers use `(event, context, opts)`; `@types/aws-lambda` `Handler` still types the third arg as `Callback`. */
type MiddyApiGatewayHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
  opts: MiddyHandlerObject,
) => Promise<APIGatewayProxyResult> | APIGatewayProxyResult | undefined;

export function createHttpHandler(handler: APIGatewayProxyHandler) {
  return middy<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context>()
    .use(httpJsonBodyParser({ disableContentTypeError: true }))
    .use(httpCors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }))
    .use(httpErrorHandler())
    .handler(handler as unknown as MiddyApiGatewayHandler);
}
