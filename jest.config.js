// jest.config.js
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS config file */
const fs = require("fs");
const nextJest = require("next/jest");
const path = require("path");
const ts = require("typescript");
/* eslint-enable @typescript-eslint/no-require-imports -- CommonJS config file */

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Production code only. Test code, db_scripts/ (test-data generators) and
// tool config files are not matched by any pattern.
const COLLECT_COVERAGE_FROM = [
  "app/**/*.{ts,tsx}",
  "pages/**/*.{ts,tsx}",
  "site-config/**/*.{ts,tsx}",
  "migrations/**/*.ts",
  "scripts/*.ts",
  "instrumentation.ts",
  "proxy.ts",
  "mdx-components.tsx",
];

/**
 * Whether a TypeScript file compiles to no JavaScript (only types, or only
 * type imports and exports).
 * @param file - Path relative to the repo root.
 * @returns True when the compiled output is empty apart from `export {}`.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- JavaScript file; the JSDoc gives the type
function emitsNoJavaScript(file) {
  const { outputText } = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, file), "utf8"),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
      },
      fileName: file,
    },
  );
  return (
    outputText
      .replace(/\/\/# sourceMappingURL=.*/, "")
      .replace(/export\s*\{\s*\};?/g, "")
      .trim() === ""
  );
}

/**
 * Ignore patterns for the coverage candidates that compile to no JavaScript.
 * Walks the top-level directory or file each `COLLECT_COVERAGE_FROM` pattern
 * starts with.
 * @returns One exact-path pattern per such file.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- JavaScript file; the JSDoc gives the type
function typeOnlyFilePatterns() {
  return COLLECT_COVERAGE_FROM.flatMap((glob) => {
    const [top, ...rest] = glob.split("/");
    if (rest.length === 0) return [top];
    return fs
      .readdirSync(path.join(__dirname, top), { recursive: true })
      .map((file) => path.join(top, file));
  })
    .filter((file) => /\.tsx?$/.test(file) && emitsNoJavaScript(file))
    .map(
      (file) => `^<rootDir>/${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    );
}

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  collectCoverageFrom: COLLECT_COVERAGE_FROM,
  // Test helpers inside the production folders (Jest manual mocks), and files
  // that compile to no JavaScript. Those cannot run, but v8 coverage reads an
  // untested file untransformed and reports its type declarations as uncovered
  // lines (jestjs/jest#14422, open).
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__mocks__/",
    ...typeOnlyFilePatterns(),
  ],
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
  // Measured coverage rounded down, minus 1 (lines 60.20%, branches 79.32%).
  coverageThreshold: {
    global: {
      branches: 78,
      lines: 59,
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
  // With `--maxWorkers=1` (the `test` script), test files run one at a time in
  // a worker that restarts once it passes this limit. One long process slows
  // v8 coverage as each file's modules pile up; this keeps the run near 2x a
  // run without coverage, instead of over 8x.
  workerIdleMemoryLimit: "256MB",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
