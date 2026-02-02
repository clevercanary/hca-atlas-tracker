import { execSync } from "child_process";
import * as path from "path";

describe("migration-down environment guard", () => {
  const scriptPath = path.join(__dirname, "..", "scripts", "migration-down.ts");

  // Safety check: These tests should only run with ENVIRONMENT=test
  // The tests verify that migration-down is blocked when ENVIRONMENT is not "test"
  beforeAll(() => {
    // Ensure we're running with ENVIRONMENT=test (set by npm test script)
    if (process.env.ENVIRONMENT !== "test") {
      throw new Error(
        "Test suite requires ENVIRONMENT=test (should be set by npm test script)"
      );
    }
  });

  it("should exit with error when ENVIRONMENT is not set", () => {
    expect(() => {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only PATH to avoid exposing real credentials and unset ENVIRONMENT
        env: {
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("should exit with error when ENVIRONMENT is production", () => {
    expect(() => {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only ENVIRONMENT to avoid exposing real credentials
        env: {
          ENVIRONMENT: "production",
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("should exit with error when ENVIRONMENT is dev", () => {
    expect(() => {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only ENVIRONMENT to avoid exposing real credentials
        env: {
          ENVIRONMENT: "dev",
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("should print error message when ENVIRONMENT is not test", () => {
    try {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only ENVIRONMENT to avoid exposing real credentials
        env: {
          ENVIRONMENT: "production",
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    } catch (error: unknown) {
      // execSync throws an error with stderr and stdout as Buffers
      const err = error as Error & { stderr?: Buffer; stdout?: Buffer };
      const errorOutput =
        (err.stderr?.toString() ?? "") + (err.stdout?.toString() ?? "");
      expect(errorOutput).toContain(
        "ERROR: migrate:down is only allowed in test environment"
      );
    }
  });

  it("should print error message when ENVIRONMENT is not set", () => {
    try {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only PATH to avoid exposing real credentials
        env: {
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    } catch (error: unknown) {
      // execSync throws an error with stderr and stdout as Buffers
      const err = error as Error & { stderr?: Buffer; stdout?: Buffer };
      const errorOutput =
        (err.stderr?.toString() ?? "") + (err.stdout?.toString() ?? "");
      expect(errorOutput).toContain(
        "ERROR: migrate:down is only allowed in test environment"
      );
    }
  });
});
