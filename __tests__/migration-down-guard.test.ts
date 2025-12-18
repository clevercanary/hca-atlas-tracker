import { execSync } from "child_process";
import * as path from "path";

describe("migration-down environment guard", () => {
  const scriptPath = path.join(__dirname, "..", "scripts", "migration-down.ts");

  // Safety check: These tests should only run with explicit APP_ENV set to aws-dev or aws-prod
  // to test the guard functionality. The guard will prevent the script from actually executing.
  beforeAll(() => {
    // Ensure we're not accidentally running in a production environment
    if (
      process.env.APP_ENV === "aws-prod" ||
      process.env.APP_ENV === "aws-dev"
    ) {
      throw new Error(
        "Test suite cannot run in aws-prod or aws-dev environment"
      );
    }
  });

  it("should exit with error when APP_ENV is aws-prod", () => {
    expect(() => {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only APP_ENV to avoid exposing real credentials
        env: {
          APP_ENV: "aws-prod",
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("should exit with error when APP_ENV is aws-dev", () => {
    expect(() => {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only APP_ENV to avoid exposing real credentials
        env: {
          APP_ENV: "aws-dev",
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("should print error message for aws-prod environment", () => {
    try {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only APP_ENV to avoid exposing real credentials
        env: {
          APP_ENV: "aws-prod",
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    } catch (error: unknown) {
      const err = error as { stderr: Buffer; stdout: Buffer };
      const errorOutput = err.stderr.toString() + err.stdout.toString();
      expect(errorOutput).toContain(
        "ERROR: migrate:down is disabled in production and dev environments."
      );
    }
  });

  it("should print error message for aws-dev environment", () => {
    try {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        // Pass only APP_ENV to avoid exposing real credentials
        env: {
          APP_ENV: "aws-dev",
          PATH: process.env.PATH,
        } as Partial<NodeJS.ProcessEnv> as NodeJS.ProcessEnv,
        stdio: "pipe",
      });
    } catch (error: unknown) {
      const err = error as { stderr: Buffer; stdout: Buffer };
      const errorOutput = err.stderr.toString() + err.stdout.toString();
      expect(errorOutput).toContain(
        "ERROR: migrate:down is disabled in production and dev environments."
      );
    }
  });
});
