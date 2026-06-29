import { GetServerSidePropsContext } from "next";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock(
  "../site-config/hca-atlas-tracker/local/authentication/next-auth-config",
  () => ({ nextAuthOptions: {} }),
);

import { getServerSession } from "next-auth";
import { ROLE } from "../app/apis/catalog/hca-atlas-tracker/common/entities";
import { getAdminPageRedirect } from "../app/routes/adminPageGuard";
import { ROUTE } from "../app/routes/constants";

const mockGetServerSession = getServerSession as jest.Mock;

const REQUESTED_URL = "/atlases/create";

const CONTEXT = {
  req: {},
  res: {},
  resolvedUrl: REQUESTED_URL,
} as unknown as GetServerSidePropsContext;

const ATLASES_REDIRECT = {
  redirect: { destination: ROUTE.ATLASES, permanent: false },
};

const SIGN_IN_REDIRECT = {
  redirect: {
    destination: `${ROUTE.LANDING}?callbackUrl=${encodeURIComponent(REQUESTED_URL)}`,
    permanent: false,
  },
};

describe("getAdminPageRedirect", () => {
  beforeEach(() => {
    mockGetServerSession.mockReset();
  });

  it("allows a CONTENT_ADMIN (no redirect)", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "",
      user: { role: ROLE.CONTENT_ADMIN },
    });
    expect(await getAdminPageRedirect(CONTEXT)).toBeNull();
  });

  it("redirects an authenticated non-admin role to atlases", async () => {
    mockGetServerSession.mockResolvedValue({
      expires: "",
      user: { role: ROLE.INTEGRATION_LEAD },
    });
    expect(await getAdminPageRedirect(CONTEXT)).toEqual(ATLASES_REDIRECT);
  });

  it("redirects an authenticated user with no role to atlases", async () => {
    mockGetServerSession.mockResolvedValue({ expires: "", user: {} });
    expect(await getAdminPageRedirect(CONTEXT)).toEqual(ATLASES_REDIRECT);
  });

  it("redirects an unauthenticated request to sign-in with a callbackUrl", async () => {
    mockGetServerSession.mockResolvedValue(null);
    expect(await getAdminPageRedirect(CONTEXT)).toEqual(SIGN_IN_REDIRECT);
  });
});
