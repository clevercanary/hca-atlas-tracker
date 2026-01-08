import { TextDecoder, TextEncoder } from "util";
import { TEST_S3_BUCKET } from "./constants";

Object.assign(global, { TextDecoder, TextEncoder }); // https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest

let testRandomUuids: string[] = [];
export function setTestRandomUuids(uuids: string[]): void {
  testRandomUuids = uuids.slice();
}
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: (): string => {
      const uuid = testRandomUuids.shift();
      if (!uuid) throw new Error("Consumed unexpected number of test UUIDs");
      return uuid;
    },
  },
});

jest.mock("../app/utils/pg-app-connect-config");

// Set ENVIRONMENT to test for all test runs
process.env.ENVIRONMENT = "test";

process.env.GOOGLE_SERVICE_ACCOUNT =
  '"TEST_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS"';
process.env.GOOGLE_AUTH =
  '{"type": "service_account", "client_email": "test@example.com"}';

process.env.AWS_DATA_BUCKET = TEST_S3_BUCKET;

// Loaded via setupFilesAfterEnv: hooks are available synchronously.
afterAll(async () => {
  const { endPgPool } = await import("../app/services/database");
  await endPgPool();
});
