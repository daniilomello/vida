/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/.serverless/"],
  passWithNoTests: true,
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.json",
        // Type-checking is tsc's job; ts-jest only transpiles.
        // Disabling diagnostics also fixes @types resolution across monorepo roots.
        diagnostics: false,
      },
    ],
  },
};

module.exports = config;
