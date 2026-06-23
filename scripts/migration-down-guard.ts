/**
 * Throws if `migrate:down` is being run in a deployed (AWS dev or prod)
 * environment, where rolling a migration back would be destructive. The
 * environment is identified via the `APP_ENV` value baked into deployed images.
 * @param appEnv - Value of the `APP_ENV` environment variable.
 * @throws Error - When `appEnv` indicates a deployed environment.
 */
export function assertMigrationDownAllowed(appEnv: string | undefined): void {
  if (appEnv === "aws-dev" || appEnv === "aws-prod") {
    throw new Error(
      "migrate:down is disabled in production and dev environments.",
    );
  }
}
