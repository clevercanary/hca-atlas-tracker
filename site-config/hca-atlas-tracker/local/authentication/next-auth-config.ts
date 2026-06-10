import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SESSION_MAX_AGE } from "./constants";
import { GoogleAuthParams } from "./entities";

// During `next build` page-data collection the env vars aren't loaded; module
// init must not throw. At any other phase (dev server, prod server, test) we
// want to fail fast if the credentials are missing or unparseable, because
// the alternative is an opaque error mid-OAuth handshake.
const IS_BUILD_PHASE = process.env.NEXT_PHASE === "phase-production-build";

const googleAuthParams: Partial<GoogleAuthParams> = JSON.parse(
  process.env.GOOGLE_AUTH || "{}",
);

if (!IS_BUILD_PHASE) {
  if (!googleAuthParams.client_id || !googleAuthParams.client_secret) {
    throw new Error(
      "GOOGLE_AUTH environment variable must contain a JSON object with non-empty `client_id` and `client_secret`.",
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
  session: {
    maxAge: SESSION_MAX_AGE / 1000,
  },
};
