import { TextDecoder, TextEncoder } from "util";

Object.assign(global, { TextDecoder, TextEncoder }); // https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest

process.env.GOOGLE_SERVICE_ACCOUNT_JSON =
  '"TEST_GOOGLE_SERVICE_ACCOUNT_CREDENTIALS"';
