/**
 * @jest-environment node
 */
// Next's middleware testing utilities need the Fetch API's `Request`.
import { ROUTE } from "@/app/routes/constants";
import { config } from "@/proxy";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

jest.mock("next-auth/middleware", () => ({ withAuth: jest.fn() }));

describe("proxy matcher", () => {
  it.each([
    ROUTE.API_TOKEN,
    ROUTE.ATLASES,
    ROUTE.REFRESH,
    ROUTE.FILES_ADMIN,
    "/team/1",
  ])("runs the auth middleware for page %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each([
    "/api/me",
    "/api/me/api-token",
    "/api/atlases",
    "/_next/static/chunk.js",
    "/favicon.ico",
    "/fonts/font.woff2",
  ])("skips %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
  });
});
