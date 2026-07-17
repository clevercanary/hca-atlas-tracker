import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {
  getUserRoleByEmail,
  registerUser,
} from "../../../../app/services/users";
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
  callbacks: {
    // Persist the user's role on the JWT so the middleware (proxy.ts) and SSR
    // can read it without a DB call. `user` is only set on initial sign-in, so
    // we backfill from `token.email` whenever the role is missing — this both
    // populates sessions issued before this feature shipped (no re-login
    // needed) and avoids a DB hit once the role is present. Tradeoff: a later
    // DB role *change* isn't reflected until the token is reissued — acceptable
    // here, as role changes are rare and admin-driven.
    //
    // On initial sign-in we also auto-register first-time users here (rather
    // than relying solely on the client-side `PUT /api/me`), so the
    // `hat.users` row exists before the session cookie is issued. Otherwise a
    // first-time user landing on a deep link can have the page's own data
    // fetch reach the server before registration commits and get a spurious
    // 403 (issue #1456).
    async jwt({ token, user }) {
      if (token.role === undefined) {
        if (user?.email) {
          token.role = await registerUser(user.email, user.name ?? "");
        } else if (token.email) {
          token.role = await getUserRoleByEmail(token.email);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
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
