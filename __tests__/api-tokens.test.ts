import {
  API_TOKEN_MAX_AGE,
  issueApiToken,
  verifyApiToken,
} from "@/app/services/api-tokens";
import { UnauthenticatedError } from "@/app/utils/api-errors";
import { encodeTestJwt } from "@/testing/api-tokens";
import { encode } from "next-auth/jwt";

const TEST_EMAIL = "test-api-token@example.com";

describe("issueApiToken", () => {
  it("issues a token that verifies as the given user", async () => {
    const { token } = await issueApiToken(TEST_EMAIL);
    expect(await verifyApiToken(token)).toEqual(TEST_EMAIL);
  });

  it("reports an expiry 30 days after issue", async () => {
    const issuedAt = Date.now();
    const { expires } = await issueApiToken(TEST_EMAIL);
    const expiresMs = new Date(expires).getTime();
    expect(
      Math.abs(expiresMs - (issuedAt + API_TOKEN_MAX_AGE * 1000)),
    ).toBeLessThan(2000);
  });

  it("issues a distinct token on each call", async () => {
    const { token: tokenA } = await issueApiToken(TEST_EMAIL);
    const { token: tokenB } = await issueApiToken(TEST_EMAIL);
    expect(tokenA).not.toEqual(tokenB);
  });
});

describe("verifyApiToken", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("rejects an expired token", async () => {
    const { token } = await issueApiToken(TEST_EMAIL);
    jest.useFakeTimers({
      now: Date.now() + (API_TOKEN_MAX_AGE + 60) * 1000,
    });
    await expect(verifyApiToken(token)).rejects.toThrow(UnauthenticatedError);
  });

  it("accepts a token shortly before it expires", async () => {
    const { token } = await issueApiToken(TEST_EMAIL);
    jest.useFakeTimers({
      now: Date.now() + (API_TOKEN_MAX_AGE - 60) * 1000,
    });
    expect(await verifyApiToken(token)).toEqual(TEST_EMAIL);
  });

  // Pins the salt and scope the other forged-token cases rely on, so they
  // can't pass for the wrong reason.
  it("accepts a token forged with the API token salt and scope", async () => {
    const token = await encodeTestJwt({
      token: { email: TEST_EMAIL, scope: "api-read" },
    });
    expect(await verifyApiToken(token)).toEqual(TEST_EMAIL);
  });

  it("rejects a session token, which is encrypted with NextAuth's default salt", async () => {
    const sessionToken = await encodeTestJwt({
      salt: "",
      token: { email: TEST_EMAIL, scope: "api-read" },
    });
    await expect(verifyApiToken(sessionToken)).rejects.toThrow(
      UnauthenticatedError,
    );
  });

  it("rejects a token encrypted with a different secret", async () => {
    const token = await encode({
      salt: "hat-api-token",
      secret: "some-other-secret",
      token: { email: TEST_EMAIL, scope: "api-read" },
    });
    await expect(verifyApiToken(token)).rejects.toThrow(UnauthenticatedError);
  });

  it("rejects a token with the wrong scope", async () => {
    const token = await encodeTestJwt({
      token: { email: TEST_EMAIL, scope: "api-write" },
    });
    await expect(verifyApiToken(token)).rejects.toThrow(UnauthenticatedError);
  });

  it("rejects a token with no scope", async () => {
    const token = await encodeTestJwt({
      token: { email: TEST_EMAIL },
    });
    await expect(verifyApiToken(token)).rejects.toThrow(UnauthenticatedError);
  });

  it("rejects a token with no email", async () => {
    const token = await encodeTestJwt({
      token: { scope: "api-read" },
    });
    await expect(verifyApiToken(token)).rejects.toThrow(UnauthenticatedError);
  });

  it("rejects a malformed token", async () => {
    await expect(verifyApiToken("not-a-token")).rejects.toThrow(
      UnauthenticatedError,
    );
  });

  it("rejects an empty token", async () => {
    await expect(verifyApiToken("")).rejects.toThrow(UnauthenticatedError);
  });
});
