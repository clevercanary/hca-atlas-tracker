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

// Production code. Test code, db_scripts/ (test-data generators), .d.ts-only
// folders and tool config files are left out.
const COVERAGE_DIRS = ["app", "pages", "site-config", "migrations", "scripts"];
const COVERAGE_FILES = ["instrumentation.ts", "mdx-components.tsx", "proxy.ts"];

/* eslint-disable @typescript-eslint/explicit-function-return-type -- JavaScript file; the JSDoc gives the types */

/**
 * Whether a TypeScript file compiles to no JavaScript (only types, interfaces
 * or type re-exports).
 * @param file - Path relative to the repo root.
 * @returns True when the compiled output holds no code.
 */
function emitsNoJavaScript(file) {
  const { outputText } = ts.transpileModule(
    fs.readFileSync(path.join(__dirname, file), "utf8"),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        removeComments: true,
      },
      fileName: file,
    },
  );
  // A types-only module compiles to `export {};`, after any "use client".
  const code = outputText.replace(/^["']use client["'];/, "").trim();
  return code === "" || code === "export {};";
}

/**
 * Coverage ignore patterns for the coverage candidates that compile to no
 * JavaScript. Jest substitutes `<rootDir>` unescaped, so each pattern is the
 * escaped absolute path instead.
 * @returns One exact-path pattern per such file.
 */
function typesOnlyFilePatterns() {
  return COVERAGE_DIRS.flatMap((dir) =>
    fs
      .readdirSync(path.join(__dirname, dir), { recursive: true })
      .map((file) => path.join(dir, file)),
  )
    .concat(COVERAGE_FILES)
    .filter((file) => /\.tsx?$/.test(file) && emitsNoJavaScript(file))
    .map(
      (file) =>
        `^${path.join(__dirname, file).replace(/[$()*+.?[\\\]^{|}]/g, "\\$&")}$`,
    );
}

/* eslint-enable @typescript-eslint/explicit-function-return-type -- JavaScript file; the JSDoc gives the types */

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  collectCoverageFrom: [
    ...COVERAGE_DIRS.map((dir) => `${dir}/**/*.{ts,tsx}`),
    ...COVERAGE_FILES,
  ],
  // Jest manual mocks, and files that compile to no JavaScript: v8 coverage
  // reports an untested types-only file as uncovered lines (jestjs/jest#14422).
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__mocks__/",
    ...typesOnlyFilePatterns(),
  ],
  coverageProvider: "v8",
  // The table goes to the log; maxCols keeps file names from being cut short.
  // The totals file feeds the CI step summary, the XML feeds diff-cover.
  coverageReporters: [
    ["text", { maxCols: 120 }],
    ["text-summary", { file: "coverage-summary.txt" }],
    "cobertura",
  ],
  // Each floor is the measured coverage, rounded down, minus 1.
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
  // v8 coverage slows as one process's memory grows (jestjs/jest#14287), so
  // the worker restarts past this limit. It has no effect under --runInBand,
  // which is why the `test` script uses --maxWorkers=1.
  workerIdleMemoryLimit: "256MB",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
