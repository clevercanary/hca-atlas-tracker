import { TextDecoder, TextEncoder } from "util";
import { TEST_S3_BUCKET, TEST_VALIDATION_RESULTS_BUCKET } from "./constants";

/**
 * Node's `TextEncoder`, but returning a `Uint8Array` from the test sandbox's
 * realm rather than Node's. Under jsdom the two realms' `Uint8Array`s are
 * different classes, so libraries that check `instanceof Uint8Array` (e.g.
 * `jose`, under `next-auth/jwt`) reject Node's bytes.
 */
class SandboxTextEncoder extends TextEncoder {
  encode(input?: string): Uint8Array<ArrayBuffer> {
    return new Uint8Array(super.encode(input));
  }
}

Object.assign(global, { TextDecoder, TextEncoder: SandboxTextEncoder }); // https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest

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

jest.mock("@/app/utils/pg-app-connect-config");

process.env.GOOGLE_SERVICE_ACCOUNT =
  '"TEST_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS"';
process.env.GOOGLE_AUTH =
  '{"type": "service_account", "client_email": "test@example.com"}';

process.env.AWS_DATA_BUCKET = TEST_S3_BUCKET;
process.env.AWS_VALIDATION_RESULTS_BUCKET = TEST_VALIDATION_RESULTS_BUCKET;
process.env.AWS_RESOURCE_CONFIG = JSON.stringify({
  s3_buckets: [TEST_S3_BUCKET, TEST_VALIDATION_RESULTS_BUCKET],
  sns_topics: [],
});

// Loaded via setupFilesAfterEnv: hooks are available synchronously.
afterAll(async () => {
  const { endPgPool } = await import("@/app/services/database");
  await endPgPool();
});
