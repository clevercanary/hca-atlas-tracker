import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SESSION_MAX_AGE } from "./constants";
import { GoogleAuthParams } from "./entities";

// During `next build` page-data collection the env vars aren't loaded; module
// init must not throw. At any other phase (dev server, prod server, test) we
// want to fail fast if the credentials are missing or unparseable, because
// the alternative is an opaque error mid-OAuth handshake.
const IS_BUILD_PHASE = process.env.NEXT_PHASE === "phase-production-build";

let googleAuthParams: Partial<GoogleAuthParams> = {};
try {
  googleAuthParams = JSON.parse(process.env.GOOGLE_AUTH || "{}");
} catch (error) {
  // A present-but-malformed GOOGLE_AUTH must not break `next build` either;
  // at any other phase, fail fast with context.
  if (!IS_BUILD_PHASE) {
    throw new Error(
      `GOOGLE_AUTH environment variable contains invalid JSON: ${error}`,
    );
  }
}

if (!IS_BUILD_PHASE) {
  if (!googleAuthParams.client_id || !googleAuthParams.client_secret) {
    throw new Error(
      "GOOGLE_AUTH environment variable must contain a JSON object with non-empty `client_id` and `client_secret`.",
    );
  }
  // The NextAuth API route derives a fallback secret in dev when none is
  // configured, but `withAuth` in `proxy.ts` only reads
  // NEXTAUTH_SECRET — with no shared secret the middleware rejects every
  // session and login loops back to the sign-in page forever. Fail fast
  // instead of shipping that silent loop.
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error(
      "NEXTAUTH_SECRET environment variable must be set; the auth middleware cannot validate sessions without it.",
    );
  }
}

export const nextAuthOptions: NextAuthOptions = {
  debug: false,
  pages: {
    signIn: "/",
  },
  providers: [
    GoogleProvider({
      clientId: googleAuthParams.client_id ?? "",
      clientSecret: googleAuthParams.client_secret ?? "",
    }),
  ],
  // Explicit so the API route, `getServerSession` callers, and the
  // middleware all validate sessions with the same secret (the API route
  // would otherwise silently derive its own fallback in dev).
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    maxAge: SESSION_MAX_AGE / 1000,
  },
};
