import { assertMigrationDownAllowed } from "../scripts/migration-down-guard";

const DISABLED_MESSAGE =
  "migrate:down is disabled in production and dev environments.";

describe("assertMigrationDownAllowed", () => {
  it("throws in the aws-prod environment", () => {
    expect(() => assertMigrationDownAllowed("aws-prod")).toThrow(
      DISABLED_MESSAGE,
    );
  });

  it("throws in the aws-dev environment", () => {
    expect(() => assertMigrationDownAllowed("aws-dev")).toThrow(
      DISABLED_MESSAGE,
    );
  });

  it("does not throw when APP_ENV is unset", () => {
    expect(() => assertMigrationDownAllowed(undefined)).not.toThrow();
  });

  it("does not throw in non-deployed environments", () => {
    expect(() => assertMigrationDownAllowed("local")).not.toThrow();
    expect(() => assertMigrationDownAllowed("aws-test")).not.toThrow();
  });
});
