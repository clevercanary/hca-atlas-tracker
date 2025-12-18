import { execSync } from "child_process";
import * as path from "path";

describe("migration-down environment guard", () => {
  const scriptPath = path.join(__dirname, "..", "scripts", "migration-down.ts");

  it("should exit with error when APP_ENV is aws-prod", () => {
    expect(() => {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        env: { ...process.env, APP_ENV: "aws-prod" },
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("should exit with error when APP_ENV is aws-dev", () => {
    expect(() => {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        env: { ...process.env, APP_ENV: "aws-dev" },
        stdio: "pipe",
      });
    }).toThrow();
  });

  it("should print error message for aws-prod environment", () => {
    try {
      execSync(`ts-node -O '{"module": "commonjs"}' ${scriptPath}`, {
        env: { ...process.env, APP_ENV: "aws-prod" },
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
        env: { ...process.env, APP_ENV: "aws-dev" },
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
