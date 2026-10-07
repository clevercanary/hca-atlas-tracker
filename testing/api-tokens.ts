// Kept out of `testing/utils.ts`, which `testing/setup.ts` loads before it
// installs the `TextEncoder` shim: importing `next-auth/jwt` there would load
// `jose` too early.
import { encode } from "next-auth/jwt";

interface TestJwtParams {
  maxAge?: number;
  salt?: string;
  token: Record<string, unknown>;
}

/**
 * Encodes a NextAuth JWT with the test `NEXTAUTH_SECRET`, for forging tokens
 * that are valid or deliberately wrong in one respect. The salt defaults to the
 * API token salt, written out here rather than imported so that tests pin its
 * value; pass `""` for NextAuth's session salt.
 * @param params - Token claims, and optionally the salt and max age.
 * @param params.maxAge - Max age in seconds (negative for an expired token).
 * @param params.salt - Key derivation salt.
 * @param params.token - Token claims.
 * @returns encoded token.
 */
export async function encodeTestJwt({
  maxAge,
  salt = "hat-api-token",
  token,
}: TestJwtParams): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET must be set in tests");
  return await encode({ maxAge, salt, secret, token });
}
