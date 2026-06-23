import { assertMigrationDownAllowed } from "../scripts/migration-down-guard";

const DISABLED_MESSAGE = "migrate:down is disabled in deployed environments.";

describe("assertMigrationDownAllowed", () => {
  it("throws in a production runtime (deployed images set NODE_ENV=production)", () => {
    expect(() =>
      assertMigrationDownAllowed({ appEnv: undefined, nodeEnv: "production" }),
    ).toThrow(DISABLED_MESSAGE);
  });

  it("throws for any AWS environment (e.g. aws-dev, aws-prod, aws-staging)", () => {
    for (const appEnv of ["aws-dev", "aws-prod", "aws-staging"]) {
      expect(() =>
        assertMigrationDownAllowed({ appEnv, nodeEnv: undefined }),
      ).toThrow(DISABLED_MESSAGE);
    }
  });

  it("does not throw in the test runtime (NODE_ENV=test)", () => {
    expect(() =>
      assertMigrationDownAllowed({ appEnv: undefined, nodeEnv: "test" }),
    ).not.toThrow();
  });

  it("does not throw for local development (NODE_ENV unset, no APP_ENV)", () => {
    expect(() =>
      assertMigrationDownAllowed({ appEnv: undefined, nodeEnv: undefined }),
    ).not.toThrow();
    expect(() =>
      assertMigrationDownAllowed({ appEnv: undefined, nodeEnv: "development" }),
    ).not.toThrow();
  });
});
