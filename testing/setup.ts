import { TextDecoder, TextEncoder } from "util";

Object.assign(global, { TextDecoder, TextEncoder }); // https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest

process.env.GOOGLE_SERVICE_ACCOUNT =
  '"TEST_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS"';
process.env.GOOGLE_AUTH =
  '{"type": "service_account", "client_email": "test@example.com"}';

// Loaded via setupFilesAfterEnv: hooks are available synchronously.
afterAll(async () => {
  const { endPgPool } = await import("../app/services/database");
  await endPgPool();
});
