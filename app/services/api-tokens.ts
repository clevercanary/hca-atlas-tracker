import { type HCAAtlasTrackerIssuedApiToken } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { UnauthenticatedError } from "@/app/utils/api-errors";
import { decode, encode } from "next-auth/jwt";

// This module is the only place API tokens are encoded or decoded, so that if
// NextAuth is replaced or upgraded (v5 derives keys differently), it is the one
// thing to reimplement — e.g. directly on `jose`. Tokens issued before such a
// change would need re-issuing, which their 30-day expiry makes acceptable.

/**
 * Salt for deriving the API token encryption key from `NEXTAUTH_SECRET`.
 * Session cookies use NextAuth's default salt (`""`), so the two derive
 * different keys: a session cookie can never decode as an API token, nor the
 * reverse. Set explicitly so NextAuth's defaults can't change it.
 */
const API_TOKEN_SALT = "hat-api-token";

/**
 * Scope claim carried by every API token; checked on decode as a second guard
 * alongside the distinct salt.
 */
const API_TOKEN_SCOPE = "api-read";

/**
 * Lifetime of an API token, in seconds.
 */
export const API_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * The user an API token acts as. The token is bound to the user's ID, which
 * never changes, and also carries their email so that changing it revokes the
 * token: emails can move between accounts (an admin can edit them, and an
 * unknown email registers a new account on sign-in).
 */
export interface ApiTokenSubject {
  email: string;
  userId: number;
}

/**
 * Issue a read-only API token acting as the given user.
 * @param subject - The user the token acts as.
 * @param subject.email - The user's email.
 * @param subject.userId - The user's ID.
 * @returns the token and its expiry, as an ISO date string.
 */
export async function issueApiToken({
  email,
  userId,
}: ApiTokenSubject): Promise<HCAAtlasTrackerIssuedApiToken> {
  const secret = getSecret();
  const token = await encode({
    maxAge: API_TOKEN_MAX_AGE,
    salt: API_TOKEN_SALT,
    secret,
    token: { email, scope: API_TOKEN_SCOPE, userId },
  });
  // Read the expiry back from the token rather than recomputing it, so the
  // reported date is exactly the one that's enforced.
  const payload = await decode({ salt: API_TOKEN_SALT, secret, token });
  if (typeof payload?.exp !== "number")
    throw new Error("Issued API token has no expiry");
  return { expires: new Date(payload.exp * 1000).toISOString(), token };
}

/**
 * Verify an API token and get the user it acts as.
 * @param token - API token, as provided in a bearer `Authorization` header.
 * @returns the user the token acts as.
 * @throws UnauthenticatedError - If the token is malformed, expired, encrypted with a different key (e.g. it's a session cookie), or lacks the API token scope, an email or a user ID.
 */
export async function verifyApiToken(token: string): Promise<ApiTokenSubject> {
  // The underlying decode error is deliberately dropped: it's never needed to
  // explain a rejection, and leaving it out keeps it out of the logs.
  const payload = await decode({
    salt: API_TOKEN_SALT,
    secret: getSecret(),
    token,
  }).catch(() => null);
  if (
    payload?.scope !== API_TOKEN_SCOPE ||
    typeof payload.email !== "string" ||
    !payload.email ||
    !Number.isInteger(payload.userId)
  )
    throw new UnauthenticatedError("Invalid or expired API token");
  return { email: payload.email, userId: Number(payload.userId) };
}

/**
 * Get the secret API tokens are encrypted with.
 * @returns the secret.
 */
function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret)
    throw new Error(
      "NEXTAUTH_SECRET environment variable must be set to issue or verify API tokens",
    );
  return secret;
}
