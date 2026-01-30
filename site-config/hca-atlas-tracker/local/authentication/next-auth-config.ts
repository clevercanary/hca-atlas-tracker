import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SESSION_MAX_AGE } from "./constants";
import { GoogleAuthParams } from "./entities";

const googleAuthParams: GoogleAuthParams = JSON.parse(
  process.env.GOOGLE_AUTH ?? "",
);

export const nextAuthOptions: NextAuthOptions = {
  debug: false,
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: googleAuthParams.client_id,
      clientSecret: googleAuthParams.client_secret,
    }),
  ],
  session: {
    maxAge: SESSION_MAX_AGE / 1000,
  },
};
