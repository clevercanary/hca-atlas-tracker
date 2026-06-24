/**
 * Throws if `migrate:down` is being run in a deployed environment, where
 * rolling a migration back would be destructive. Deployed runtimes are
 * identified by `NODE_ENV === "production"` (set on every built image) or an
 * `APP_ENV` in the AWS namespace; local development and tests are permitted.
 * @param env - Relevant environment variables.
 * @param env.appEnv - Value of the `APP_ENV` environment variable.
 * @param env.nodeEnv - Value of the `NODE_ENV` environment variable.
 * @throws Error - When the environment indicates a deployed runtime.
 */
export function assertMigrationDownAllowed(env: {
  appEnv: string | undefined;
  nodeEnv: string | undefined;
}): void {
  if (env.nodeEnv === "production" || env.appEnv?.startsWith("aws-")) {
    throw new Error("migrate:down is disabled in deployed environments.");
  }
}
