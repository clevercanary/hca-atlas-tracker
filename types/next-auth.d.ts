import type { DefaultSession } from "next-auth";
import type { ROLE } from "../app/apis/catalog/hca-atlas-tracker/common/entities";

// Augment NextAuth's Session/JWT with the user's role so middleware and SSR
// can read it from the JWT without a DB call. Populated by the `jwt`/`session`
// callbacks in next-auth-config.ts.
//
// NOTE: this file must NOT live at the project root — with `baseUrl: "."` a
// root-level `next-auth.d.ts` shadows the `next-auth` package for bare imports.
declare module "next-auth" {
  interface Session {
    user?: {
      role?: ROLE;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: ROLE;
  }
}
