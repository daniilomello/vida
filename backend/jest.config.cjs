/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.cjs"],
  modulePathIgnorePatterns: ["<rootDir>/.serverless/"],
  testPathIgnorePatterns: ["/node_modules/", "/.serverless/"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.jest.json",
        diagnostics: false,
      },
    ],
  },
};
