// Syntactically valid placeholders so aws-jwt-verify does not throw at import time.
process.env.COGNITO_USER_POOL_ID ||= "us-east-1_mockPoolId";
process.env.COGNITO_CLIENT_ID ||= "mockClientId";
process.env.DYNAMODB_TABLE ||= "FinanceApp-Data-test";
