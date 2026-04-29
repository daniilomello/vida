/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/.serverless/"],
  passWithNoTests: true,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "./tsconfig.json" }],
  },
};

module.exports = config;
