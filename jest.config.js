// jest.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Required for Jest setup
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Production code only. Test code, db_scripts/ (test-data generators) and
  // tool config files are not matched by any pattern.
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "pages/**/*.{ts,tsx}",
    "site-config/**/*.{ts,tsx}",
    "migrations/**/*.ts",
    "scripts/*.ts",
    "instrumentation.ts",
    "proxy.ts",
    "mdx-components.tsx",
  ],
  // Test helpers inside the production folders: Jest manual mocks.
  coveragePathIgnorePatterns: ["/node_modules/", "/__mocks__/"],
  coverageProvider: "v8",
  // File reporters only: scripts/test-coverage.sh prints the table and totals
  // to the log and the CI step summary; diff-cover reads the Cobertura XML.
  // maxCols keeps the table under the 1 MiB step-summary limit: in a file the
  // uncovered-lines column is otherwise unbounded. It also shortens long paths
  // from the left.
  coverageReporters: [
    ["text", { file: "coverage-table.txt", maxCols: 120 }],
    ["text-summary", { file: "coverage-summary.txt" }],
    "cobertura",
  ],
  // Measured coverage rounded down, minus 1 (lines 58.22%, branches 75.83%).
  coverageThreshold: {
    global: {
      branches: 74,
      lines: 57,
    },
  },
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // node_modules only (no <rootDir>): closes runtime resolution of bare
  // repo-root specifiers (e.g. require("app/foo")) now that tsconfig has no
  // baseUrl. The `@/` alias resolves via moduleNameMapper below regardless.
  moduleDirectories: ["node_modules"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^ky$": "<rootDir>/__mocks__/ky.ts",
    "^sinon$": "sinon/pkg/sinon.js",
  },
  setupFilesAfterEnv: ["<rootDir>/testing/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  // jsdom defaults customExportConditions to ['browser'], which resolves
  // subpath imports (e.g. @aws-sdk/core/client) to browser builds missing
  // node-only helpers. Restore node conditions so AWS SDK clients load.
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
